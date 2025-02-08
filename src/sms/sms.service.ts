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
        },
      ],
    });

    const group_price = group.price;
    const date = new Date();
    const currentYear = String(date.getFullYear());
    let currentMonth = String(date.getMonth() + 1).padStart(2, '0');

    let studentPromises = group.student.map((studentGroup) =>
      this.repoStudent.findByPk(studentGroup.student_id, {
        include: [
          {
            model: Payment,
          },
        ],
      }),
    );

    let students = await Promise.all(studentPromises);

    students = students.filter((student) => {
      let totalPaid = 0;
      let totalDiscount = 0;

      for (let payment of student.payment) {
        if (payment.year == currentYear && payment.month == currentMonth) {
          totalPaid += Number(payment.price);
          totalDiscount = Number(payment.discount || 0); 
        }
      }

      let discountedPrice = Math.round(
        Number(group_price) * (1 - totalDiscount / 100),
      );
      return totalPaid < discountedPrice;
    });

    if (students.length === 0) return; 

    let token = '';
    let bearerToken = '';

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', 'tolibjonubaydullayevbusiness@gmail.com');
      data.append('password', 'YstIi7TtZE1tTCMns9VVKdKA4AArA6wrLb98cjic');

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
          `Assalomu alaykum ${student.full_name} ning ota-onasi! 
          Farzandingiz ${student.full_name} ning JORIY OY uchun TO'LOV larini amalga oshirishingiz kerak! 
          Unutmang, FARZANDINGIZNING O'QITUVCHISI o'z vaqtida MAOSH olishi sizning o'z vaqtida to'lov qilishingizga bog'liq! 
          Hurmat bilan CAMELOT o'quv markazi.`,
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
      data.append('email', 'tolibjonubaydullayevbusiness@gmail.com');
      data.append('password', 'YstIi7TtZE1tTCMns9VVKdKA4AArA6wrLb98cjic');
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
      data.append('email', 'tolibjonubaydullayevbusiness@gmail.com');
      data.append('password', 'YstIi7TtZE1tTCMns9VVKdKA4AArA6wrLb98cjic');
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
            `Assalomu alaykum ${student.full_name} ning ota-onasi. Farzandingiz ${student.full_name} bugun BIZNING DARSLARIMIZGA QATNASHMADI! Unutmang, farzandingiz darslardan qolib ketishi tufayli ko’zlangan natijaga yetishishi qiyinlashadi. Hurmat bilan CAMELOT o’quv markazi!`,
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
