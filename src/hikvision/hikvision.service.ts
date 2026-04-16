import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as https from 'https';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import { Student } from 'src/student/models/student.model';
import { StudentAttendance } from 'src/student_attendance/models/student_attendance.model';
import { Op } from 'sequelize';

interface DigestChallenge {
  realm: string;
  nonce: string;
  qop: string;
  opaque: string;
}

interface AddFaceResult {
  success: boolean;
  message: string;
  hikvision_code: string;
}

interface DeleteFaceResult {
  success: boolean;
  message: string;
}

interface PingResult {
  success: boolean;
  message: string;
  status?: number;
  error?: string;
}

const DIGEST_NC = '00000001';
const MAX_PROCESSED_IDS = 1000;
const POLL_MAX_RESULTS = 20;

@Injectable()
export class HikvisionService implements OnModuleInit {
  private readonly logger = new Logger(HikvisionService.name);

  private lastEventIndex = 0;
  private readonly processedEventIds = new Set<string>();

  private readonly httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: false,
  });

  private readonly http: AxiosInstance;

  constructor(
    @InjectModel(Student)
    private readonly studentRepo: typeof Student,
    @InjectModel(StudentAttendance)
    private readonly attendanceRepo: typeof StudentAttendance,
  ) {
    this.http = axios.create({
      httpsAgent: this.httpsAgent,
      timeout: 30_000,
    });
  }

  async onModuleInit() {
    await this.initLastEventIndex();
  }

  private get baseURL(): string {
    return `https://${process.env.HIKVISION_IP}`;
  }

  private get username(): string {
    return process.env.HIKVISION_USER ?? 'admin';
  }

  private get password(): string {
    return process.env.HIKVISION_PASS ?? 'password';
  }

  private md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseDigestChallenge(wwwAuth: string): DigestChallenge {
    const match = (key: string) =>
      wwwAuth.match(new RegExp(`${key}="([^"]+)"`))?.[1] ?? '';

    return {
      realm: match('realm'),
      nonce: match('nonce'),
      qop: wwwAuth.match(/qop="?([^",\s]+)"?/)?.[1] ?? 'auth',
      opaque: match('opaque'),
    };
  }

  private buildDigestHeader(
    method: string,
    path: string,
    challenge: DigestChallenge,
  ): string {
    const { realm, nonce, qop, opaque } = challenge;
    const cnonce = crypto.randomBytes(8).toString('hex');
    const ha1 = this.md5(`${this.username}:${realm}:${this.password}`);
    const ha2 = this.md5(`${method.toUpperCase()}:${path}`);
    const response = this.md5(
      `${ha1}:${nonce}:${DIGEST_NC}:${cnonce}:${qop}:${ha2}`,
    );

    return [
      `Digest username="${this.username}"`,
      `realm="${realm}"`,
      `nonce="${nonce}"`,
      `uri="${path}"`,
      `qop=${qop}`,
      `nc=${DIGEST_NC}`,
      `cnonce="${cnonce}"`,
      `response="${response}"`,
      opaque ? `opaque="${opaque}"` : '',
    ]
      .filter(Boolean)
      .join(', ');
  }

  private async fetchDigestChallenge(path: string): Promise<DigestChallenge> {
    const url = `${this.baseURL}${path}`;

    try {
      await this.http.get(url, { timeout: 10_000 });
      throw new Error('Qurilma 401 qaytarmadi');
    } catch (err) {
      const wwwAuth: string = err.response?.headers?.['www-authenticate'] ?? '';

      if (err.response?.status === 401 && wwwAuth) {
        return this.parseDigestChallenge(wwwAuth);
      }

      throw err;
    }
  }

  private async digestRequest(
    method: string,
    path: string,
    data?: unknown,
    extraHeaders?: Record<string, string>,
  ) {
    const challenge = await this.fetchDigestChallenge(path);
    const authorization = this.buildDigestHeader(method, path, challenge);

    await this.sleep(300);

    return this.http.request({
      method,
      url: `${this.baseURL}${path}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
        Authorization: authorization,
      },
    });
  }

  private async digestMultipart(path: string, form: FormData) {
    const challenge = await this.fetchDigestChallenge(path);
    const authorization = this.buildDigestHeader('POST', path, challenge);

    await this.sleep(300);

    return this.http.post(`${this.baseURL}${path}`, form, {
      timeout: 60_000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...form.getHeaders(),
        Authorization: authorization,
      },
    });
  }

  async initLastEventIndex(): Promise<void> {
    try {
      const res = await this.digestRequest(
        'POST',
        '/ISAPI/AccessControl/AcsEvent?format=json',
        {
          AcsEventCond: {
            searchID: '1',
            searchResultPosition: 0,
            maxResults: 1,
            major: 0,
            minor: 0,
          },
        },
      );

      this.lastEventIndex = res.data?.AcsEvent?.totalMatches ?? 0;
      this.logger.log(`✅ Event index boshlandi: ${this.lastEventIndex}`);
    } catch (err) {
      this.logger.error(`❌ initLastEventIndex xato: ${err.message}`);
    }
  }

  async pollEvents(): Promise<void> {
    try {
      const res = await this.digestRequest(
        'POST',
        '/ISAPI/AccessControl/AcsEvent?format=json',
        {
          AcsEventCond: {
            searchID: '1',
            searchResultPosition: this.lastEventIndex,
            maxResults: POLL_MAX_RESULTS,
            major: 0,
            minor: 0,
          },
        },
      );

      const list: any[] = res.data?.AcsEvent?.InfoList ?? [];
      if (list.length === 0) return;

      this.lastEventIndex += list.length;
      this.logger.log(`🔄 ${list.length} ta yangi event topildi`);

      for (const event of list) {
        await this.processEvent(event);
      }
    } catch (err) {
      this.logger.error(`❌ Polling xato: ${err.message}`);
    }
  }

  private async processEvent(event: any): Promise<void> {
    const hikvision_code: string = event?.employeeNoString;
    if (!hikvision_code) return;

    const eventId = `${hikvision_code}-${event?.time ?? ''}`;
    if (this.processedEventIds.has(eventId)) return;

    this.processedEventIds.add(eventId);
    if (this.processedEventIds.size > MAX_PROCESSED_IDS) {
      this.processedEventIds.delete(
        this.processedEventIds.values().next().value,
      );
    }

    const student = await this.studentRepo.findOne({
      where: { hikvision_code },
    });
    if (!student) {
      this.logger.warn(`⚠️ Student topilmadi: ${hikvision_code}`);
      return;
    }

    const type = await this.getNextAttendanceType(student.id);

    await this.attendanceRepo.create({
      school_id: student.school_id,
      student_id: student.id,
      type,
      time: new Date(),
    });

    this.logger.log(
      `📌 ${student.full_name} — ${type} — ${new Date().toLocaleTimeString()}`,
    );

    await this.sendTelegramNotification(student, type);
  }

  private async getNextAttendanceType(
    student_id: number,
  ): Promise<'IN' | 'OUT'> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const last = await this.attendanceRepo.findOne({
      where: {
        student_id,
        createdAt: { [Op.gte]: todayStart },
      },
      order: [['createdAt', 'DESC']],
    });
    return !last || last.type === 'OUT' ? 'IN' : 'OUT';
  }

  private async sendTelegramNotification(
    student: Student,
    type: 'IN' | 'OUT',
  ): Promise<void> {
    if (!student.parent_chat_id) return;

    try {
      const time = new Date().toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const text =
        type === 'IN'
          ? `✅ Farzandingiz *${student.full_name}* maktabga keldi\n🕐 Vaqt: ${time}`
          : `🔔 Farzandingiz *${student.full_name}* maktabdan chiqdi\n🕐 Vaqt: ${time}`;

      await axios.post(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        { chat_id: student.parent_chat_id, text, parse_mode: 'Markdown' },
        { timeout: 10_000 },
      );

      this.logger.log(`📱 Telegram yuborildi: ${student.full_name}`);
    } catch (err) {
      this.logger.error(`❌ Telegram xatosi: ${err.message}`);
    }
  }

  async ping(): Promise<PingResult> {
    try {
      const res = await this.digestRequest('GET', '/ISAPI/System/deviceInfo');
      return {
        success: true,
        message: 'Qurilma online ✅',
        status: res.status,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Qurilma offline ❌',
        error: err.message,
      };
    }
  }

  async addFace(
    student_id: number,
    file: Express.Multer.File,
  ): Promise<AddFaceResult> {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');

    const hikvision_code =
      student.hikvision_code ?? `S${String(student_id).padStart(5, '0')}`;

    try {
      await this.ensureFDLibExists();

      await this.deleteUserFromDevice(hikvision_code);
      await this.sleep(1_500);

      await this.digestRequest(
        'POST',
        '/ISAPI/AccessControl/UserInfo/Record?format=json',
        {
          UserInfo: {
            employeeNo: hikvision_code,
            name: student.full_name,
            userType: 'normal',
            Valid: {
              enable: true,
              beginTime: '2020-01-01T00:00:00',
              endTime: '2030-01-01T00:00:00',
              timeType: 'local',
            },
            doorRight: '1',
            RightPlan: [{ doorNo: 1, planTemplateNo: '1' }],
          },
        },
      );
      this.logger.log(`👤 User qo'shildi: ${hikvision_code}`);
      await this.sleep(1_000);

      const form = new FormData();
      form.append(
        'FaceDataRecord',
        JSON.stringify({
          faceLibType: 'blackFD',
          FDID: '1',
          FPID: hikvision_code,
        }),
        { contentType: 'application/json' },
      );
      form.append('img', file.buffer, {
        filename: `${hikvision_code}.jpg`,
        contentType: 'image/jpeg',
      });

      await this.digestMultipart(
        '/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json',
        form,
      );

      await student.update({ hikvision_code });

      this.logger.log(`✅ Yuz qo'shildi: ${student.full_name}`);
      return {
        success: true,
        message: `${student.full_name} qurilmaga qo'shildi`,
        hikvision_code,
      };
    } catch (err) {
      const detail = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      this.logger.error(`❌ Yuz qo'shishda xato: ${detail}`);
      throw new Error(
        `Hikvision xato: ${err.response?.data?.statusString ?? err.message}`,
      );
    }
  }

  async deleteFace(student_id: number): Promise<DeleteFaceResult> {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');
    if (!student.hikvision_code)
      throw new NotFoundException("Studentda hikvision_code yo'q");

    try {
      await this.deleteUserFromDevice(student.hikvision_code);
      await student.update({ hikvision_code: null });

      this.logger.log(`🗑️ Yuz o'chirildi: ${student.full_name}`);
      return {
        success: true,
        message: `${student.full_name} qurilmadan o'chirildi`,
      };
    } catch (err) {
      const detail = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      this.logger.error(`❌ O'chirishda xato: ${detail}`);
      throw new Error(
        `Hikvision xato: ${err.response?.data?.statusString ?? err.message}`,
      );
    }
  }

  private async ensureFDLibExists(): Promise<void> {
    try {
      await this.digestRequest('GET', '/ISAPI/Intelligent/FDLib?format=json');
    } catch {
      await this.digestRequest('POST', '/ISAPI/Intelligent/FDLib', {
        FDLib: { FDID: '1', name: 'Students' },
      });
      this.logger.log('📁 FDLib yaratildi');
    }
  }

  private async deleteUserFromDevice(hikvision_code: string): Promise<void> {
    try {
      await this.digestRequest(
        'PUT',
        '/ISAPI/AccessControl/UserInfo/Delete?format=json',
        {
          UserInfoDelCond: {
            EmployeeNoList: [{ employeeNo: hikvision_code }],
          },
        },
      );
      this.logger.log(`🗑️ Eski user o'chirildi: ${hikvision_code}`);
    } catch {
      // User mavjud bo'lmasa — davom etamiz
    }
  }
}
