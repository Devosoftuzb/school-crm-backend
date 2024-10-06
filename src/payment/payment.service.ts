import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';
import { Group } from 'src/group/models/group.model';
import { Employee } from 'src/employee/models/employee.model';
import { Op } from 'sequelize';

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
    });

    if (!student) {
      throw new BadRequestException(
        `Student with id ${createPaymentDto.student_id} not found in school ${createPaymentDto.school_id}`,
      );
    }

    const payment = await this.repo.create(createPaymentDto);
    return {
      message: 'Payment created successfully',
      payment,
    };
  }

  async findAll() {
    return this.repo.findAll({ include: { all: true } });
  }

  async findAllBySchoolId(school_id: number) {
    return this.repo.findAll({ where: { school_id }, include: { all: true } });
  }

  async getOneDay(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDate = now.getDate();

      const allUsers = await this.repo.findAll({
        where: {
          school_id,
          createdAt: {
            [Op.gte]: new Date(currentYear, currentMonth - 1, currentDate),
            [Op.lt]: new Date(currentYear, currentMonth - 1, currentDate + 1),
          },
        },
        include: { all: true },
        offset,
        limit,
      });

      const total_count = allUsers.length;
      const total_pages = Math.ceil(total_count / limit);

      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          const group = await this.repoGroup.findOne({
            where: {
              id: user.group.id,
              school_id: school_id,
            },
            include: { all: true },
          });

          const employee = await this.repoEmployee.findOne({
            where: {
              id: group.employee[0]?.employee_id,
            },
            include: { all: true },
          });

          return {
            id: user.id,
            student_name: user.student.full_name,
            teacher_name: employee?.full_name,
            group_name: user.group.name,
            group_price: user.group.price,
            method: user.method,
            price: user.price,
            month: user.month,
            createdAt: user.createdAt,
          };
        }),
      );

      return {
        status: 200,
        data: {
          records: allProduct,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findGroupDayHistory(
    school_id: number,
    group_id: number,
    year: number,
    month: number,
    day: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      

      const allUsers = await this.repo.findAll({
        where: {
          school_id,
          group_id,
          createdAt: {
            [Op.gte]: new Date(year, month - 1, day),
            [Op.lt]: new Date(year, month - 1, day + 1),
          },
        },
        include: { all: true },
        offset,
        limit,
      });

      const total_count = allUsers.length;
      const total_pages = Math.ceil(total_count / limit);

      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          const group = await this.repoGroup.findOne({
            where: {
              id: user.group.id,
              school_id: school_id,
            },
            include: { all: true },
          });

          const employee = await this.repoEmployee.findOne({
            where: {
              id: group.employee[0]?.employee_id,
            },
            include: { all: true },
          });

          return {
            id: user.id,
            student_name: user.student.full_name,
            teacher_name: employee?.full_name,
            group_name: user.group.name,
            group_price: user.group.price,
            method: user.method,
            price: user.price,
            month: user.month,
            createdAt: user.createdAt,
          };
        }),
      );

      return {
        status: 200,
        data: {
          records: allProduct,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findDayHistory(
    school_id: number,
    year: number,
    month: number,
    day: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      

      const allUsers = await this.repo.findAll({
        where: {
          school_id,
          createdAt: {
            [Op.gte]: new Date(year, month - 1, day),
            [Op.lt]: new Date(year, month - 1, day + 1),
          },
        },
        include: { all: true },
        offset,
        limit,
      });

      const total_count = allUsers.length;
      const total_pages = Math.ceil(total_count / limit);

      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          const group = await this.repoGroup.findOne({
            where: {
              id: user.group.id,
              school_id: school_id,
            },
            include: { all: true },
          });

          const employee = await this.repoEmployee.findOne({
            where: {
              id: group.employee[0]?.employee_id,
            },
            include: { all: true },
          });

          return {
            id: user.id,
            student_name: user.student.full_name,
            teacher_name: employee?.full_name,
            group_name: user.group.name,
            group_price: user.group.price,
            method: user.method,
            price: user.price,
            month: user.month,
            createdAt: user.createdAt,
          };
        }),
      );

      return {
        status: 200,
        data: {
          records: allProduct,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number, school_id: number) {
    const payment = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: { all: true },
    });

    if (!payment) {
      throw new BadRequestException(
        `Payment with id ${id} not found in school ${school_id}`,
      );
    }

    return payment;
  }

  async update(
    id: number,
    school_id: number,
    updatePaymentDto: UpdatePaymentDto,
  ) {
    const payment = await this.findOne(id, school_id);
    await payment.update(updatePaymentDto);

    return {
      message: 'Payment updated successfully',
      payment,
    };
  }

  async remove(id: number, school_id: number) {
    const payment = await this.findOne(id, school_id);
    await payment.destroy();

    return {
      message: 'Payment removed successfully',
    };
  }
}
