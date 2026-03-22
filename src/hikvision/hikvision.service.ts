import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Student } from 'src/student/models/student.model';
import { StudentAttendance } from 'src/student_attendance/models/student_attendance.model';
import * as https from 'https';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class HikvisionService {
  private readonly logger = new Logger(HikvisionService.name);
  private isListening = false;

  constructor(
    @InjectModel(Student)
    private studentRepo: typeof Student,
    @InjectModel(StudentAttendance)
    private attendanceRepo: typeof StudentAttendance,
  ) {}

  private get baseURL() {
    return `https://${process.env.HIKVISION_IP}`;
  }

  private get agent() {
    return new https.Agent({ rejectUnauthorized: false });
  }

  private get username() {
    return process.env.HIKVISION_USER || 'admin';
  }

  private get password() {
    return process.env.HIKVISION_PASS || 'password';
  }

  private md5(str: string) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private async buildDigestAuth(method: string, path: string): Promise<string> {
    const url = `${this.baseURL}${path}`;

    let wwwAuth = '';
    try {
      await axios({
        method,
        url,
        httpsAgent: this.agent,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      const status = err.response?.status;
      wwwAuth = err.response?.headers?.['www-authenticate'] || '';
      if (status !== 401 && !wwwAuth) throw err;
    }

    if (!wwwAuth) throw new Error('WWW-Authenticate header kelmadi');

    const realm = wwwAuth.match(/realm="([^"]+)"/)?.[1] || '';
    const nonce = wwwAuth.match(/nonce="([^"]+)"/)?.[1] || '';
    const qop = wwwAuth.match(/qop="?([^",\s]+)"?/)?.[1] || 'auth';
    const opaque = wwwAuth.match(/opaque="([^"]+)"/)?.[1] || '';
    const nc = '00000001';
    const cnonce = crypto.randomBytes(8).toString('hex');
    const ha1 = this.md5(`${this.username}:${realm}:${this.password}`);
    const ha2 = this.md5(`${method.toUpperCase()}:${path}`);
    const resp = this.md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);

    return [
      `Digest username="${this.username}"`,
      `realm="${realm}"`,
      `nonce="${nonce}"`,
      `uri="${path}"`,
      `qop=${qop}`,
      `nc=${nc}`,
      `cnonce="${cnonce}"`,
      `response="${resp}"`,
      opaque ? `opaque="${opaque}"` : '',
    ]
      .filter(Boolean)
      .join(', ');
  }

  private async digestRequest(
    method: string,
    path: string,
    data?: any,
    extraHeaders?: any,
  ) {
    const url = `${this.baseURL}${path}`;
    const contentType = extraHeaders?.['Content-Type'] || 'application/json';
    const authHeader = await this.buildDigestAuth(method, path);

    return axios({
      method,
      url,
      httpsAgent: this.agent,
      data,
      timeout: 30000,
      headers: {
        Authorization: authHeader,
        'Content-Type': contentType,
        ...extraHeaders,
      },
    });
  }

  private async digestMultipart(path: string, form: any) {
    const url = `${this.baseURL}${path}`;
    const formHeaders = form.getHeaders();

    let wwwAuth = '';
    try {
      await axios.post(url, null, {
        httpsAgent: this.agent,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
    } catch (err) {
      wwwAuth = err.response?.headers?.['www-authenticate'] || '';
      if (!wwwAuth) throw err;
    }

    if (!wwwAuth) throw new Error('WWW-Authenticate header kelmadi');

    const realm = wwwAuth.match(/realm="([^"]+)"/)?.[1] || '';
    const nonce = wwwAuth.match(/nonce="([^"]+)"/)?.[1] || '';
    const qop = wwwAuth.match(/qop="?([^",\s]+)"?/)?.[1] || 'auth';
    const opaque = wwwAuth.match(/opaque="([^"]+)"/)?.[1] || '';
    const nc = '00000001';
    const cnonce = crypto.randomBytes(8).toString('hex');
    const ha1 = this.md5(`${this.username}:${realm}:${this.password}`);
    const ha2 = this.md5(`POST:${path}`);
    const resp = this.md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);

    const authHeader = [
      `Digest username="${this.username}"`,
      `realm="${realm}"`,
      `nonce="${nonce}"`,
      `uri="${path}"`,
      `qop=${qop}`,
      `nc=${nc}`,
      `cnonce="${cnonce}"`,
      `response="${resp}"`,
      opaque ? `opaque="${opaque}"` : '',
    ]
      .filter(Boolean)
      .join(', ');

    return axios.post(url, form, {
      httpsAgent: this.agent,
      timeout: 30000,
      headers: {
        ...formHeaders,
        Authorization: authHeader,
      },
    });
  }

  // ✅ Real-time event stream
  async startEventListener() {
    if (this.isListening) return;
    this.isListening = true;

    const path = '/ISAPI/Event/notification/alertStream';
    const url = `${this.baseURL}${path}`;

    this.logger.log('🎧 Event listener ishga tushdi...');

    try {
      const authHeader = await this.buildDigestAuth('GET', path);

      const res = await axios.get(url, {
        httpsAgent: this.agent,
        timeout: 0,
        responseType: 'stream',
        headers: {
          Authorization: authHeader,
          Accept: 'multipart/x-mixed-replace',
        },
      });

      let buffer = '';

      res.data.on('data', async (chunk: Buffer) => {
        buffer += chunk.toString();

        // XML event ni ajratib olish
        const xmlMatch = buffer.match(
          /<EventNotificationAlert[\s\S]*?<\/EventNotificationAlert>/,
        );
        if (xmlMatch) {
          buffer = buffer.replace(xmlMatch[0], '');
          await this.processEvent(xmlMatch[0]);
        }
      });

      res.data.on('end', () => {
        this.logger.warn(
          '⚠️ Stream uzildi, 3 sekunddan keyin qayta ulanadi...',
        );
        this.isListening = false;
        setTimeout(() => this.startEventListener(), 3000);
      });

      res.data.on('error', (err: Error) => {
        this.logger.error(`❌ Stream xato: ${err.message}`);
        this.isListening = false;
        setTimeout(() => this.startEventListener(), 5000);
      });
    } catch (err) {
      this.logger.error(`❌ Event listener xato: ${err.message}`);
      this.isListening = false;
      setTimeout(() => this.startEventListener(), 5000);
    }
  }

  private async processEvent(xmlStr: string): Promise<void> {
    try {
      const { parseStringPromise } = await import('xml2js');
      const result = await parseStringPromise(xmlStr);

      const event = result?.EventNotificationAlert;
      const hikvision_code =
        event?.AccessControllerEvent?.[0]?.employeeNoString?.[0];
      const rawTime = event?.dateTime?.[0];
      const direction =
        event?.AccessControllerEvent?.[0]?.currentVerifyMode?.[0];

      if (!hikvision_code) return;

      const student = await this.studentRepo.findOne({
        where: { hikvision_code },
      });

      if (!student) {
        this.logger.warn(`⚠️ Student topilmadi: ${hikvision_code}`);
        return;
      }

      const type: 'IN' | 'OUT' = direction?.includes('exit') ? 'OUT' : 'IN';

      await this.attendanceRepo.create({
        school_id: student.school_id,
        student_id: student.id,
        type,
        time: rawTime ? new Date(rawTime) : new Date(),
      });

      this.logger.log(
        `📌 ${student.full_name} — ${type} — ${new Date().toLocaleTimeString()}`,
      );
    } catch (err) {
      this.logger.error(`❌ Event parse xato: ${err.message}`);
    }
  }

  async ping() {
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

  private async ensureFDLibExists() {
    try {
      await this.digestRequest('GET', '/ISAPI/Intelligent/FDLib?format=json');
    } catch {
      await this.digestRequest('POST', '/ISAPI/Intelligent/FDLib', {
        FDLib: { FDID: '1', name: 'Students' },
      });
      this.logger.log('FDLib yaratildi');
    }
  }

  async addFace(student_id: number, file: Express.Multer.File) {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');

    const hikvision_code =
      student.hikvision_code ?? `S${String(student_id).padStart(5, '0')}`;

    try {
      await this.ensureFDLibExists();

      // 1. Avval mavjud userni o'chirish
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
        // Yo'q bo'lsa davom etamiz
      }

      // 2. Person qo'shish
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

      // 3. Yuz qo'shish — multipart
      const FormData = require('form-data');
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
      this.logger.error(
        `❌ Yuz qo'shishda xato: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`,
      );
      throw new Error(
        `Hikvision xato: ${err.response?.data?.statusString || err.message}`,
      );
    }
  }

  async deleteFace(student_id: number) {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');
    if (!student.hikvision_code)
      throw new NotFoundException("Studentda hikvision_code yo'q");

    try {
      await this.digestRequest(
        'PUT',
        '/ISAPI/Intelligent/FDLib/FaceDataRecord/Delete?format=json',
        {
          FaceInfo: [
            { faceLibType: 'blackFD', FDID: '1', FPID: student.hikvision_code },
          ],
        },
      );

      await this.digestRequest(
        'PUT',
        '/ISAPI/AccessControl/UserInfo/Delete?format=json',
        {
          UserInfoDelCond: {
            EmployeeNoList: [{ employeeNo: student.hikvision_code }],
          },
        },
      );

      await student.update({ hikvision_code: null });

      this.logger.log(`🗑️ Yuz o'chirildi: ${student.full_name}`);
      return {
        success: true,
        message: `${student.full_name} qurilmadan o'chirildi`,
      };
    } catch (err) {
      this.logger.error(`❌ O'chirishda xato: ${err.message}`);
      throw new Error(`Hikvision xato: ${err.message}`);
    }
  }

  async verifyFace(student_id: number) {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');
    if (!student.hikvision_code)
      throw new NotFoundException("Studentda hikvision_code yo'q");

    try {
      const res = await this.digestRequest(
        'POST',
        '/ISAPI/Intelligent/FDLib/FaceDataRecord/Search?format=json',
        {
          searchResultPosition: 0,
          maxResults: 1,
          faceLibType: 'blackFD',
          FDID: '1',
          FPID: student.hikvision_code,
        },
      );

      const total = res.data?.SearchFaceResult?.totalMatches || 0;
      const exists = total > 0;

      return {
        success: true,
        exists,
        message: exists
          ? `${student.full_name} qurilmada mavjud ✅`
          : `${student.full_name} qurilmada yo'q ❌`,
      };
    } catch {
      return {
        success: false,
        exists: false,
        message: `${student.full_name} qurilmada yo'q ❌`,
      };
    }
  }
}
