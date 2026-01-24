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
  CreateSmsPaymentDto,
} from './dto/create-sm.dto';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Payment } from 'src/payment/models/payment.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { Employee } from 'src/employee/models/employee.model';
import { Op } from 'sequelize';

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
    const group = await this.repo.findOne({
      where: { id: smsDto.group_id },
      include: [
        {
          model: StudentGroup,
          include: [
            {
              model: Student,
              include: [
                {
                  model: Payment,
                  required: false,
                  where: {
                    status: { [Op.ne]: 'delete' },
                    group_id: smsDto.group_id,
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const group_price = group.price;
    const date = new Date();
    const currentYear = String(date.getFullYear());
    let currentMonth = String(date.getMonth() + 1).padStart(2, '0');

    const students = group.student
      .map((sg) => sg.student)
      .filter((student) => {
        let totalPaid = 0;
        let totalDiscountPercent = 0;
        let totalDiscountSum = 0;

        for (const payment of student.payment ?? []) {
          if (payment.year === currentYear && payment.month === currentMonth) {
            totalPaid += Number(payment.price || 0);

            totalDiscountPercent += Number(payment.discount || 0);

            totalDiscountSum += Number(payment.discountSum || 0);
          }
        }

        const priceAfterPercent = Math.round(
          Number(group_price) * (1 - totalDiscountPercent / 100),
        );

        const finalPrice = Math.max(priceAfterPercent - totalDiscountSum, 0);

        return totalPaid < finalPrice;
      });

    if (students.length === 0) return;

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
}
