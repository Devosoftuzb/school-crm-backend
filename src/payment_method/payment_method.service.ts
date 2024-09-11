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
      message: 'Payment method created',
      student,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllByMethodId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id: school_id },
      include: { all: true },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id },
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count();
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: user,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number, school_id: number) {
    const paymentMethod = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!paymentMethod) {
      throw new BadRequestException(`Payment method with id ${id} not found`);
    }

    return paymentMethod;
  }

  async update(
    id: number,
    school_id: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    const paymentMethod = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!paymentMethod) {
      throw new BadRequestException(`Payment method with id ${id} not found`);
    }

    await paymentMethod.update(updatePaymentMethodDto);

    return {
      message: 'Payment method update',
      paymentMethod,
    };
  }

  async remove(id: number, school_id: number) {
    const paymentMethod = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!paymentMethod) {
      throw new BadRequestException(`Payment method with id ${id} not found`);
    }

    await paymentMethod.destroy();

    return {
      message: 'Payment method remove',
    };
  }
}
