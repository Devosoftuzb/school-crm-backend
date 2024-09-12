import { BadRequestException } from '@nestjs/common';

export async function sendSMS(phone: string, message: string, token: string) {
  try {
    const axios = require('axios');
    const FormData = require('form-data');
    const data = new FormData();
    data.append('mobile_phone', phone);
    data.append('message', message);
    data.append('from', 'DevoSoft');
    data.append('callback_url', 'http://0000.uz/test.php');
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://notify.eskiz.uz/api/message/sms/send',
      headers: {
        ...data.getHeaders(),
        Authorization: token,
      },
      data,
    };
    axios(config)
      .then(function (response: any) {
        // console.log(JSON.stringify(response.data));
      })
      .catch(function (error: any) {
        console.log(error);
      });
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
