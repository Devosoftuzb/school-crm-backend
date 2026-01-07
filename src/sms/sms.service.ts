import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import { Group } from 'src/group/models/group.model';
import { Student } from 'src/student/models/student.model';
import { sendSMS } from 'src/common/utils/senSMS';
import {
  CreateSmsAttendanceDto,
  CreateSmsDevDto,
  CreateSmsGroupDto,
  CreateSmsPaymentDto,
} from './dto/create-sm.dto';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Payment } from 'src/payment/models/payment.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { Employee } from 'src/employee/models/employee.model';

@Injectable()
export class SmsService {
  constructor(
    @InjectModel(Group) private repo: typeof Group,
    @InjectModel(Student) private repoStudent: typeof Student,
    private configService: ConfigService,
  ) {}

  private async getEskizToken(): Promise<string> {
    try {
      const data = new FormData();
      data.append('email', this.configService.get('ESKIZ_EMAIL'));
      data.append('password', this.configService.get('ESKIZ_PASSWORD'));

      const response = await axios({
        method: 'post',
        url: 'http://notify.eskiz.uz/api/auth/login',
        data,
        headers: data.getHeaders(),
      });

      return response.data.data.token;
    } catch (error) {
      console.error('Eskiz token olishda xatolik:', error.message);
      throw new BadRequestException("SMS xizmati bilan bog'lanishda xatolik");
    }
  }

  async sendPayment(smsDto: CreateSmsPaymentDto) {
    try {
      const group = await this.repo.findOne({
        where: { id: smsDto.group_id },
        include: [{ model: StudentGroup }],
      });

      if (!group) {
        throw new BadRequestException('Guruh topilmadi');
      }

      const group_price = group.price;
      const date = new Date();
      const currentYear = String(date.getFullYear());
      const currentMonth = String(date.getMonth() + 1).padStart(2, '0');

      const studentPromises = group.student.map((studentGroup) =>
        this.repoStudent.findByPk(studentGroup.student_id, {
          include: [{ model: Payment }],
        }),
      );

      let students = await Promise.all(studentPromises);

      students = students.filter((student) => {
        if (!student) return false;

        let totalPaid = 0;
        let totalDiscount = 0;

        for (const payment of student.payment) {
          if (payment.year == currentYear && payment.month == currentMonth) {
            totalPaid += Number(payment.price);
            totalDiscount = Number(payment.discount || 0);
          }
        }

        const discountedPrice = Math.round(
          Number(group_price) * (1 - totalDiscount / 100),
        );
        return totalPaid < discountedPrice;
      });

      if (students.length === 0) {
        return { message: "Barcha studentlar to'lov qilgan", count: 0 };
      }

      const token = await this.getEskizToken();
      const bearerToken = `Bearer ${token}`;

      const smsPromises = students.map((student) =>
        sendSMS(
          student.parents_phone_number,
          `Hurmatli ota-ona, ${student.full_name} uchun joriy oy to'lovi kutilmoqda. Iltimos, o'z vaqtida amalga oshiring. CAMELOT LC`,
          bearerToken,
        ),
      );

      await Promise.all(smsPromises);

      return {
        message: 'SMS muvaffaqiyatli yuborildi',
        count: students.length,
      };
    } catch (error) {
      console.error("To'lov SMS yuborishda xatolik:", error);
      throw new BadRequestException(
        error.message || 'SMS yuborishda xatolik yuz berdi',
      );
    }
  }

  async sendDev(smsDto: CreateSmsDevDto) {
    try {
      const group = await this.repo.findOne({
        where: { id: smsDto.group_id },
        include: [{ model: StudentGroup }],
      });

      if (!group || !group.student || group.student.length === 0) {
        throw new BadRequestException('Guruh yoki studentlar topilmadi');
      }

      const studentPromises = group.student.map((studentGroup) =>
        this.repoStudent.findByPk(studentGroup.student_id),
      );

      const students = (await Promise.all(studentPromises)).filter(
        (student) => student !== null,
      );

      if (students.length === 0) {
        throw new BadRequestException('Studentlar topilmadi');
      }

      const token = await this.getEskizToken();
      const bearerToken = `Bearer ${token}`;

      const smsPromises = students.map((student) =>
        sendSMS(
          student.parents_phone_number,
          `Assalomu alaykum ${student.full_name} ning ota-onasi. Sizga ajoyib yangiligimiz bor. Camelot o'quv markazida kelajak kasblaridan biri bo'lgan IT(AyTi) kurslariga qabul ochiq. Agar farzandingizni kelajakda yetuk mutaxassis bo'lishini xohlasangiz kurslarimizda kutib qolamiz. Ma'lumot uchun: +998933279137`,
          bearerToken,
        ),
      );

      await Promise.all(smsPromises);

      return {
        message: 'SMS muvaffaqiyatli yuborildi',
        count: students.length,
      };
    } catch (error) {
      console.error('Reklama SMS yuborishda xatolik:', error);
      throw new BadRequestException(
        error.message || 'SMS yuborishda xatolik yuz berdi',
      );
    }
  }

  async sendAttendance(smsDto: CreateSmsAttendanceDto) {
    try {
      const student = await this.repoStudent.findByPk(smsDto.student_id);

      if (!student) {
        throw new BadRequestException('Student topilmadi');
      }

      if (!student.parents_phone_number) {
        throw new BadRequestException('Ota-ona telefon raqami mavjud emas');
      }

      const token = await this.getEskizToken();
      const bearerToken = `Bearer ${token}`;

      await sendSMS(
        student.parents_phone_number,
        `${student.full_name} bugun darsda qatnashmadi. Doimiy qatnashish, yaxshi natija uchun muhim. Hurmat bilan CAMELOT LC`,
        bearerToken,
      );

      return {
        message: 'SMS muvaffaqiyatli yuborildi',
        student: student.full_name,
      };
    } catch (error) {
      console.error('Davomat SMS yuborishda xatolik:', error);
      throw new BadRequestException(
        error.message || 'SMS yuborishda xatolik yuz berdi',
      );
    }
  }

  async sendGroup(smsDto: CreateSmsGroupDto) {
    try {
      const student = await this.repoStudent.findByPk(smsDto.student_id, {
        include: [
          {
            model: StudentGroup,
            include: [
              {
                model: Group,
                attributes: ['name', 'start_time'],
                include: [
                  {
                    model: EmployeeGroup,
                    include: [
                      {
                        model: Employee,
                        attributes: ['full_name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!student) {
        throw new BadRequestException('Student topilmadi');
      }

      const studentGroup = Array.isArray(student.group)
        ? student.group[0]
        : student.group;

      if (!studentGroup) {
        throw new BadRequestException('Student guruhga biriktirilmagan');
      }

      const group = studentGroup.group;

      if (!group) {
        throw new BadRequestException("Guruh ma'lumotlari topilmadi");
      }

      const employeeGroup = Array.isArray(group.employee)
        ? group.employee[0]
        : group.employee;

      if (!employeeGroup || !employeeGroup.employee) {
        throw new BadRequestException("O'qituvchi ma'lumotlari topilmadi");
      }

      const teacher = employeeGroup.employee;

      const token = await this.getEskizToken();
      const bearerToken = `Bearer ${token}`;

      await sendSMS(
        student.phone_number,
        `Hurmatli ${student.full_name}! Sizni ${teacher.full_name} olib boradigan "${group.name}" guruhi darsiga bugun ${group.start_time} da CAMELOT LC ga kelishingizni so'raymiz.`,
        bearerToken,
      );

      return {
        message: 'SMS muvaffaqiyatli yuborildi',
        student: student.full_name,
        group: group.name,
        teacher: teacher.full_name,
      };
    } catch (error) {
      console.error('Guruh SMS yuborishda xatolik:', error);
      throw new BadRequestException(
        error.message || 'SMS yuborishda xatolik yuz berdi',
      );
    }
  }
}
