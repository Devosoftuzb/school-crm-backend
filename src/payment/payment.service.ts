import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';
import { Group } from 'src/group/models/group.model';
import { Employee } from 'src/employee/models/employee.model';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment) private repo: typeof Payment,
    @InjectModel(Student) private repoStudent: typeof Student,
    @InjectModel(Group) private repoGroup: typeof Group,
    @InjectModel(Employee) private repoEmployee: typeof Employee,
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

  async getOneDay(school_id: number) {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDate = now.getDate();

      const allUsers = await this.repo.findAll({
        where: { school_id: school_id },
        include: { all: true },
      });

      const filteredUsers = allUsers.filter((user) => {
        const createdAt = new Date(user.createdAt);
        const userYear = createdAt.getFullYear();
        const userMonth = createdAt.getMonth() + 1;
        const userDate = createdAt.getDate();
        return (
          userYear === currentYear &&
          userMonth === currentMonth &&
          userDate === currentDate
        );
      });

      const allProduct = await Promise.all(
        filteredUsers.map(async (user) => {
          const group = await this.repoGroup.findOne({
            where: {
              id: user.group.id,
              school_id: school_id,
            },
            include: { all: true },
          });

          const employee = await this.repoEmployee.findOne({
            where: {
              id: group.employee[0].employee_id,
            },
            include: { all: true },
          });

          return {
            id: user.id,
            student_name: user.student.full_name,
            teacher_name: employee.full_name,
            group_name: user.group.name,
            group_price: user.group.price,
            method: user.method,
            price: user.price,
            month: user.month,
            createdAt: user.createdAt
          };
        }),
      );

      return allProduct;
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
