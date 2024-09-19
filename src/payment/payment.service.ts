import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment) private repo: typeof Payment,
    @InjectModel(Student) private repoStudent: typeof Student,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const student = await this.repoStudent.findOne({
      where: {
        id: createPaymentDto.student_id,
        school_id: createPaymentDto.school_id,
      },
      include: { all: true },
    });

    if (!student) {
      throw new BadRequestException(
        `Student with id ${createPaymentDto.student_id} not found`,
      );
    }

    const payment = await this.repo.create(createPaymentDto);
    return {
      message: 'Payment created',
      payment,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllByPaymentId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id: school_id },
      include: { all: true },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 50;
      const offset = (page - 1) * limit;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const allUsers = await this.repo.findAll({
        where: { school_id: school_id },
        include: { all: true },
      });

      const filteredUsers = allUsers.filter((user) => {
        const createdAt = new Date(user.createdAt);
        const userYear = createdAt.getFullYear();
        const userMonth = createdAt.getMonth() + 1;
        return userYear === currentYear && userMonth === currentMonth;
      });

      const paginatedUsers = filteredUsers.slice(offset, offset + limit);
      const total_count = filteredUsers.length;
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: paginatedUsers,
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
    const payment = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with id ${id} not found`);
    }

    return payment;
  }

  async update(
    id: number,
    school_id: number,
    updatePaymentDto: UpdatePaymentDto,
  ) {
    const payment = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with id ${id} not found`);
    }

    await payment.update(updatePaymentDto);

    return {
      message: 'Payment update',
      payment,
    };
  }

  async remove(id: number, school_id: number) {
    const payment = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with id ${id} not found`);
    }

    await payment.destroy();

    return {
      message: 'Payment remove',
    };
  }
}
