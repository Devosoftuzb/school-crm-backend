import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';
import { Group } from 'src/group/models/group.model';
import { Employee } from 'src/employee/models/employee.model';
import { Op } from 'sequelize';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Sequelize } from 'sequelize';

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
    return this.repo.findAll({ where: { school_id } });
  }

  async findMonthHistory(
    school_id: number,
    group_id: number,
    year: string,
    month: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: {
          school_id,
          group_id,
          year,
          month,
        },
        attributes: ['id', 'method', 'price', 'discount', 'month', 'createdAt'],
        include: [
          {
            model: Group,
            attributes: ['id', 'name', 'price'],
          },
          {
            model: Student,
            attributes: ['full_name'],
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      const total_count = count;
      const total_pages = Math.ceil(total_count / limit);

      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          const group = await this.repoGroup.findOne({
            where: {
              id: user.group.id,
              school_id: school_id,
            },
            include: [
              {
                model: EmployeeGroup,
                attributes: ['employee_id'],
              },
            ],
          });

          const employee = await this.repoEmployee.findOne({
            where: {
              id: group.employee[0]?.employee_id,
            },
            attributes: ['full_name'],
          });

          return {
            id: user.id,
            student_name: user.student.full_name,
            teacher_name: employee?.full_name,
            group_name: user.group.name,
            group_price: user.group.price,
            method: user.method,
            price: user.price,
            discount: user.discount,
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

      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: {
          school_id,
          createdAt: {
            [Op.gte]: new Date(year, month - 1, day),
            [Op.lt]: new Date(year, month - 1, day + 1),
          },
        },
        attributes: ['id', 'method', 'price', 'discount', 'month', 'createdAt'],
        include: [
          {
            model: Group,
            attributes: ['id', 'name', 'price'],
          },
          {
            model: Student,
            attributes: ['full_name'],
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      const total_count = count;
      const total_pages = Math.ceil(total_count / limit);

      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          const group = await this.repoGroup.findOne({
            where: {
              id: user.group.id,
              school_id: school_id,
            },
            include: [
              {
                model: EmployeeGroup,
                attributes: ['employee_id'],
              },
            ],
          });

          const employee = await this.repoEmployee.findOne({
            where: {
              id: group.employee[0]?.employee_id,
            },
            attributes: ['full_name'],
          });

          return {
            id: user.id,
            student_name: user.student.full_name,
            teacher_name: employee.full_name,
            group_name: user.group.name,
            group_price: user.group.price,
            method: user.method,
            price: user.price,
            discount: user.discount,
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

  async findGroupHistoryDebtor(
    school_id: number,
    group_id: number,
    year: string,
    month: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      // 1. Guruhni olish (barcha o‘quvchilar bilan)
      const { count, rows: allStudents } =
        await this.repoStudent.findAndCountAll({
          where: { school_id },
          attributes: ['id', 'full_name'],
          include: [
            {
              model: StudentGroup,
              where: { group_id }, // Faqat berilgan group_id bo‘yicha filter
              attributes: ['group_id'],
            },
            {
              model: Payment, // To‘lovlar (faqat shu guruh uchun)
              required: false,
              where: { year, month, group_id },
              attributes: ['price', 'discount'],
            },
          ],
          offset,
          limit,
        });

      // 2. Guruhni olish
      const group = await this.repoGroup.findOne({
        where: { id: group_id, school_id },
        attributes: ['id', 'name', 'price'],
        include: [
          {
            model: EmployeeGroup,
            attributes: ['employee_id'],
          },
        ],
      });

      if (!group) throw new BadRequestException('Guruh topilmadi!');

      const groupPrice = Number(group.price) || 0;

      // 3. Qarzdorlarni aniqlash
      const debtors = [];

      for (const student of allStudents) {
        // Faqat shu studentning shu guruh bo‘yicha to‘lovlarini hisoblash
        const totalPaid = student.payment.reduce(
          (sum, p) => sum + (p.price || 0),
          0,
        );
        const totalDiscount = student.payment.reduce(
          (sum, p) => sum + (p.discount || 0),
          0,
        );
        const totalRemaining = groupPrice - (totalPaid + totalDiscount); // Qarzdorlik

        if (totalRemaining > 0) {
          // O‘qituvchini olish
          const teacher = await this.repoEmployee.findOne({
            where: { id: group.employee[0]?.employee_id },
            attributes: ['full_name'],
          });

          debtors.push({
            id: student.id,
            student_name: student.full_name,
            teacher_name: teacher?.full_name || 'Noma’lum',
            group_id: group.id,
            group_name: group.name,
            group_price: group.price,
            remaining_debt: totalRemaining, // Qarzdorlik summasi
          });
        }
      }

      const total_count = debtors.length;
      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records: debtors,
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

  async findHistoryDebtor(
    school_id: number,
    year: number,
    month: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      // 1. To‘lov qilgan studentlarning jami to‘lov summasini olish
      const paidData = await this.repo.findAll({
        where: {
          school_id,
          createdAt: {
            [Op.gte]: new Date(year, month - 1, 1),
            [Op.lt]: new Date(year, month, 1),
          },
        },
        attributes: [
          'student_id',
          'group_id',
          [Sequelize.fn('SUM', Sequelize.col('price')), 'totalPaid'],
          [Sequelize.fn('SUM', Sequelize.col('discount')), 'totalDiscount'],
        ],
        group: ['student_id', 'group_id'],
        raw: true,
      });

      // 2. Qarzdor studentlarni olish
      const debtors = await this.repoStudent.findAll({
        where: { school_id },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: StudentGroup,
            attributes: ['group_id'],
            include: [
              {
                model: Group,
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: EmployeeGroup,
                    attributes: ['employee_id'],
                    include: [
                      {
                        model: Employee, // O‘qituvchi modeli qo‘shildi
                        attributes: ['full_name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const formattedDebtors = debtors.map((student) => {
        return student.group
          .map((groupStudent) => {
            const group = groupStudent.group;
            const paidInfo = paidData.find(
              (p) => p.student_id === student.id && p.group_id === group.id,
            );

            const totalPaid = paidInfo
              ? paidInfo.price - (paidInfo.discount || 0)
              : 0;
            const remainingDebt = Number(group.price) - totalPaid;

            if (remainingDebt > 0) {
              return {
                id: student.id,
                student_name: student.full_name,
                teacher_name: group.employee[0]?.employee?.full_name || 'N/A', 
                group_id: group.id,
                group_name: group.name,
                group_price: group.price,
                remaining_debt: remainingDebt,
              };
            }
            return null;
          })
          .filter(Boolean);
      });

      const paginatedDebtors = formattedDebtors
        .flat()
        .slice(offset, offset + limit);

      return {
        status: 200,
        data: {
          records: paginatedDebtors,
          pagination: {
            currentPage: page,
            total_pages: Math.ceil(formattedDebtors.flat().length / limit),
            total_count: formattedDebtors.flat().length,
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
