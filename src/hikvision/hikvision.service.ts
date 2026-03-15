import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Student } from 'src/student/models/student.model';
import { StudentAttendance } from 'src/student_attendance/models/student_attendance.model';
import axios, { AxiosInstance } from 'axios';
import * as xml2js from 'xml2js';

@Injectable()
export class HikvisionService {
  private readonly logger = new Logger(HikvisionService.name);
  private readonly client: AxiosInstance;

  constructor(
    @InjectModel(Student)
    private studentRepo: typeof Student,
    @InjectModel(StudentAttendance)
    private attendanceRepo: typeof StudentAttendance,
  ) {
    this.client = axios.create({
      baseURL: process.env.HIKVISION_IP,
      auth: {
        username: process.env.HIKVISION_USER || 'admin',
        password: process.env.HIKVISION_PASS || 'password',
      },
      timeout: 5000,
    });
  }

  async ping() {
    try {
      await this.client.get('/ISAPI/System/deviceInfo');
      return { success: true, message: 'Qurilma online ✅' };
    } catch {
      return { success: false, message: 'Qurilma offline ❌' };
    }
  }

  async addFace(student_id: number, file: Express.Multer.File) {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');

    if (!student.hikvision_code) {
      throw new NotFoundException("Studentda hikvision_code yo'q");
    }

    try {
      const imageBase64 = file.buffer.toString('base64');

      await this.client.post('/ISAPI/Intelligent/FDLib/FDSetUp', {
        faceLibType: 'blackFD',
        FDID: '1',
        FPID: student.hikvision_code,
        name: student.full_name,
        faceData: imageBase64,
      });

      this.logger.log(`✅ Yuz qo'shildi: ${student.full_name}`);
      return {
        success: true,
        message: `${student.full_name} qurilmaga qo'shildi`,
      };
    } catch (err) {
      this.logger.error(`❌ Yuz qo'shishda xato: ${err.message}`);
      throw new Error(`Hikvision xato: ${err.message}`);
    }
  }

  async deleteFace(student_id: number) {
    const student = await this.studentRepo.findByPk(student_id);
    if (!student) throw new NotFoundException('Student topilmadi');

    if (!student.hikvision_code) {
      throw new NotFoundException("Studentda hikvision_code yo'q");
    }

    try {
      await this.client.delete(
        `/ISAPI/Intelligent/FDLib/FDSetUp/${student.hikvision_code}`,
      );

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

    if (!student.hikvision_code) {
      throw new NotFoundException("Studentda hikvision_code yo'q");
    }

    try {
      const res = await this.client.get(
        `/ISAPI/Intelligent/FDLib/FDSetUp/${student.hikvision_code}`,
      );

      const exists = res.status === 200;
      return {
        success: true,
        exists,
        message: exists
          ? `${student.full_name} qurilmada mavjud ✅`
          : `${student.full_name} qurilmada yo'q ❌`,
      };
    } catch {
      return {
        success: true,
        exists: false,
        message: `${student.full_name} qurilmada yo'q ❌`,
      };
    }
  }

  async handleEvent(rawXml: string): Promise<void> {
    xml2js.parseString(rawXml, async (err, result) => {
      if (err) {
        this.logger.error(`XML parse xatosi: ${err.message}`);
        return;
      }

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
    });
  }
}
