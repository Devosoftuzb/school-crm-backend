import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentMethod } from './models/payment_method.model';

@Injectable()
export class PaymentMethodService {
  constructor(@InjectModel(PaymentMethod) private repo: typeof PaymentMethod) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    const student = await this.repo.create(createPaymentMethodDto);
    return {
      message: 'Payment method created successfully',
      student,
    };
  }

  async findAllBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'name']
    });
  }

  async remove(id: number, school_id: number) {
    const paymentMethod = await this.repo.findOne({ where: { id, school_id } });
    await paymentMethod.destroy();

    return {
      message: 'Payment method removed successfully',
    };
  }
}
