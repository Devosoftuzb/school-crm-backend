import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from 'src/group/models/group.model';
import { Student } from 'src/student/models/student.model';
import { sendSMS } from 'src/common/utils/senSMS';

@Injectable()
export class SmsService {
  constructor(
    @InjectModel(Group) private repo: typeof Group,
    @InjectModel(Student) private repoStudent: typeof Student,
  ) {}
  async sendSMS(smsDto: CreateSmDto) {
    const group = await this.repo.findOne({
      where: { id: smsDto.group_id },
      include: { all: true },
    });

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
          for (let i in group){
            sendSMS(group[i].student_group.student.phone_number, smsDto.text, bearerToken);
          }
        })
        .catch(function (error: any) {
          console.log(error);
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
