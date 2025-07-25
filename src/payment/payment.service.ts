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
            student_name: user.student
              ? user.student.full_name
              : 'O‘chirilgan o‘quvchi',
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
          if (!user.group || !user.group.id) {
            // console.warn(`user.group mavjud emas: user_id = ${user.id}`);
            return null;
          }

          let teacher_name = 'Nomaʼlum';

          try {
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

            const employee_id = group?.employee?.[0]?.employee_id;

            if (employee_id) {
              const employee = await this.repoEmployee.findOne({
                where: { id: employee_id },
                attributes: ['full_name'],
              });

              if (employee?.full_name) {
                teacher_name = employee.full_name;
              }
            }
          } catch (err) {
            // console.warn(
            //   `Xatolik employee/group qismida: user_id = ${user.id}`,
            //   err.message,
            // );
          }

          return {
            id: user.id,
            student_name: user.student
              ? user.student.full_name
              : 'O‘chirilgan o‘quvchi',
            teacher_name,
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

      // const filteredProducts = allProduct.filter(Boolean);

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

      const group = await this.repoGroup.findOne({
        where: { id: group_id, school_id },
        attributes: ['id', 'name', 'price'],
        include: [
          {
            model: EmployeeGroup,
            include: [
              {
                model: Employee,
                attributes: ['id', 'full_name'],
              },
            ],
          },
          {
            model: StudentGroup,
            include: [
              {
                model: Student,
                attributes: ['id', 'full_name'],
                include: [
                  {
                    model: Payment,
                    where: { year, month },
                    required: false,
                    attributes: ['price', 'discount', 'createdAt'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!group) {
        throw new BadRequestException('Guruh topilmadi');
      }

      const groupPrice = Number(group.price);

      const teacherNames = group.employee.map((eg) => eg.employee.full_name);
      const teacherName =
        teacherNames.length > 0
          ? teacherNames.join(', ')
          : 'Noma’lum o‘qituvchi';

      let debtors: object[] = [];

      for (const studentGroup of group.student) {
        const student = studentGroup.student;
        const payments = student.payment || [];

        let totalPaid = 0;
        let totalDiscount = 0;
        let paymentDetails: object[] = [];

        for (const payment of payments) {
          const discountAmount = (groupPrice * (payment.discount || 0)) / 100;
          totalPaid += payment.price;
          totalDiscount += discountAmount;

          paymentDetails.push({
            paid_amount: payment.price,
            discount_amount: discountAmount,
            payment_date: payment.createdAt,
          });
        }

        const remainingDebt = Math.max(
          groupPrice - (totalPaid + totalDiscount),
          0,
        );

        if (remainingDebt > 0) {
          debtors.push({
            student_id: student.id,
            student_name: student.full_name,
            group_id: group.id,
            group_name: group.name,
            teacher_name: teacherName,
            group_price: groupPrice,
            debt: remainingDebt,
            payments: paymentDetails,
          });
        }
      }

      const totalDebtors = debtors.length;
      const paginatedDebtors = debtors.slice(offset, offset + limit);

      return {
        status: 200,
        data: {
          records: paginatedDebtors,
          pagination: {
            currentPage: page,
            total_pages: Math.ceil(totalDebtors / limit),
            total_count: totalDebtors,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findHistoryDebtor(
    school_id: number,
    year: string,
    month: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const allStudents = await this.repoStudent.findAll({
        where: { school_id },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: StudentGroup,
            attributes: ['group_id', 'createdAt'],
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
                        model: Employee,
                        attributes: ['id', 'full_name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: Payment,
            where: { year, month },
            required: false,
            attributes: ['price', 'discount', 'group_id', 'createdAt'],
          },
        ],
      });

      let debtors: object[] = [];

      for (const student of allStudents) {
        for (const studentGroup of student.group) {
          const group = studentGroup.group;
          const groupId = group.id;
          const groupPrice = Number(group.price);
          const joinedDate = new Date(studentGroup.createdAt);
          const checkDate = new Date(`${year}-${month}-01`);

          const joinedYear = joinedDate.getFullYear();
          const joinedMonth = joinedDate.getMonth();
          const checkYear = checkDate.getFullYear();
          const checkMonth = checkDate.getMonth();

          if (
            joinedYear > checkYear ||
            (joinedYear === checkYear && joinedMonth > checkMonth)
          ) {
            continue;
          }

          const teacher = group.employee?.[0]?.employee;
          const teacherName = teacher
            ? teacher.full_name
            : 'Noma’lum o‘qituvchi';

          const payments = student.payment.filter(
            (p) => p.group_id === groupId,
          );

          let totalPaid = 0;
          let totalDiscount = 0;
          let paymentDetails: object[] = [];

          for (const payment of payments) {
            const discountAmount = (groupPrice * (payment.discount || 0)) / 100;
            totalPaid += payment.price;
            totalDiscount += discountAmount;

            paymentDetails.push({
              paid_amount: payment.price,
              discount_amount: discountAmount,
              payment_date: payment.createdAt,
            });
          }

          const remainingDebt = Math.max(
            groupPrice - (totalPaid + totalDiscount),
            0,
          );

          if (remainingDebt > 0) {
            debtors.push({
              id: student.id,
              student_name: student.full_name,
              group_id: groupId,
              group_name: group.name,
              teacher_name: teacherName,
              group_price: groupPrice,
              debt: remainingDebt,
              payments: paymentDetails,
            });
          }
        }
      }

      const totalDebtors = debtors.length;

      const paginatedDebtors = debtors.slice(offset, offset + limit);

      return {
        status: 200,
        data: {
          records: paginatedDebtors,
          pagination: {
            currentPage: page,
            total_pages: Math.ceil(totalDebtors / limit),
            total_count: totalDebtors,
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
