import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from 'src/group/models/group.model';
import { Student } from 'src/student/models/student.model';
import { sendSMS } from 'src/common/utils/senSMS';
import {
  CreateSmsAttendanceDto,
  CreateSmsDevDto,
  CreateSmsPaymentDto,
} from './dto/create-sm.dto';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Payment } from 'src/payment/models/payment.model';
import { Op } from 'sequelize';

@Injectable()
export class SmsService {
  constructor(
    @InjectModel(Group) private repo: typeof Group,
    @InjectModel(Student) private repoStudent: typeof Student,
  ) {}

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

    let token = '';
    let bearerToken = '';

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', '');
      data.append('password', '');

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://notify.eskiz.uz/api/auth/login',
        data,
      };

      const response = await axios(config);
      token = response.data.data.token;
      bearerToken = `Bearer ${token}`;

      for (let student of students) {
        sendSMS(
          student.parents_phone_number,
          `Hurmatli ota-ona, ${student.full_name} uchun joriy oy to'lovi kutilmoqda. Iltimos, o'z vaqtida amalga oshiring. CAMELOT LC`,
          bearerToken,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendDev(smsDto: CreateSmsDevDto) {
    const group = await this.repo.findOne({
      where: { id: smsDto.group_id },
      include: [
        {
          model: StudentGroup,
        },
      ],
    });

    let student = [];
    for (let i in group.student) {
      student.push(
        await this.repoStudent.findByPk(group.student[i].student_id, {}),
      );
    }
    let token = '';
    let bearerToken = '';

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', '');
      data.append('password', '');
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://notify.eskiz.uz/api/auth/login',
        data,
      };
      axios(config)
        .then(function (response: any) {
          // console.log(JSON.stringify(response.data));
          token = JSON.stringify(response.data.data.token).slice(1, -1);
          bearerToken = `Bearer ${token}`;
          for (let i in student) {
            sendSMS(
              student[i].parents_phone_number,
              `Assalu alaykum ${student[i].full_name} ning ota-onasi .Sizga ajoyib yangiligimiz bor.Camelot o'quv markazida kelajak kasblaridan biri bo'gan IT(AyTi) kurslariga qabul ochiq.Agarda farzandizngizni kelajakda yetuk mutahassis bo'lishini hohlasangiz kurslarimizda kutib qolamiz. Ma'lumot uchun:+998933279137`,
              bearerToken,
            );
            // sendSMS(student[i].parents_phone_number, 'Bu Eskiz dan test', bearerToken);
          }
        })
        .catch(function (error: any) {
          console.log(error);
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendAttendance(smsDto: CreateSmsAttendanceDto) {
    let token = '';
    let bearerToken = '';

    const student = await this.repoStudent.findByPk(smsDto.student_id, {});

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', '');
      data.append('password', '');
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://notify.eskiz.uz/api/auth/login',
        data,
      };
      axios(config)
        .then(function (response: any) {
          // console.log(JSON.stringify(response.data));
          token = JSON.stringify(response.data.data.token).slice(1, -1);
          bearerToken = `Bearer ${token}`;
          sendSMS(
            student.parents_phone_number,
            `${student.full_name} bugun darsda qatnashmadi. Doimiy qatnashish, yaxshi natija uchun muhim. Hurmat bilan CAMELOT LC`,
            bearerToken,
          );
        })
        .catch(function (error: any) {
          console.log(error);
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
