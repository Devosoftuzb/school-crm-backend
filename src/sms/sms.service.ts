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

@Injectable()
export class SmsService {
  constructor(
    @InjectModel(Group) private repo: typeof Group,
    @InjectModel(Student) private repoStudent: typeof Student,
  ) {}
  async sendPayment(smsDto: CreateSmsPaymentDto) {
    const group = await this.repo.findOne({
      where: { id: smsDto.group_id },
      include: { all: true },
    });

    let student = [];
    for (let i in group.student) {
      student.push(
        await this.repoStudent.findByPk(group.student[i].student_id, {
          include: { all: true },
        }),
      );
    }
    let token = '';
    let bearerToken = '';

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', 'devosoftuz@gmail.com');
      data.append('password', 'cWfR05vLlH8cvqNSJ0sIUbh2aRlbFchDfhU4mZCq');
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
              `Assalomu aleykum ${student[i].full_name} ning ota-onasi, Iltimos ${group.name} kursiga ${smsDto.month} oyi uchun 15-sanagacha to‘lov qilishni unutmang. Hurmat bilan CAMELOT o‘quv markazi ! `,
              bearerToken,
            );
          }
        })
        .catch(function (error: any) {
          console.log(error);
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendDev(smsDto: CreateSmsDevDto) {
    const group = await this.repo.findOne({
      where: { id: smsDto.group_id },
      include: { all: true },
    });

    let student = [];
    for (let i in group.student) {
      student.push(
        await this.repoStudent.findByPk(group.student[i].student_id, {
          include: { all: true },
        }),
      );
    }
    let token = '';
    let bearerToken = '';

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', 'devosoftuz@gmail.com');
      data.append('password', 'cWfR05vLlH8cvqNSJ0sIUbh2aRlbFchDfhU4mZCq');
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
              `Assalomu alaykum ${student[i].full_name} ning ota-onasi Camelot o‘quv markazida IT(Ayti) kurslariga qabul boshlandi. Farzandingizni kelajak kasblari egasi bo‘lishini xohlasangiz bizga murojaat qiling. Tel: +998933279137 `,
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

    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const data = new FormData();
      data.append('email', 'devosoftuz@gmail.com');
      data.append('password', 'cWfR05vLlH8cvqNSJ0sIUbh2aRlbFchDfhU4mZCq');
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
          sendSMS(smsDto.phone_number, smsDto.text, bearerToken);
        })
        .catch(function (error: any) {
          console.log(error);
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
