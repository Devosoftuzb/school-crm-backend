import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';
import { Group } from 'src/group/models/group.model';
import { Employee } from 'src/employee/models/employee.model';
import { Op, literal } from 'sequelize';
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
    year: number,
    month: number,
    status: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const [paymentCount, halfPaymentCount, discountCount] = await Promise.all(
        [
          this.repo.count({
            where: {
              school_id,
              discount: 0,
              discountSum: 0,
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              discount: 0,
              discountSum: 0,
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              [Op.or]: [
                { discount: { [Op.ne]: 0 } },
                { discountSum: { [Op.ne]: 0 } },
              ],
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
          }),
        ],
      );

      let whereClause: any = {
        school_id,
        createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
      };

      let groupInclude: any = {
        model: Group,
        attributes: ['id', 'name', 'price'],
      };

      if (status === 'payment') {
        whereClause.discount = 0;
        whereClause.discountSum = 0;
        groupInclude.required = true;
        groupInclude.on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'halfPayment') {
        whereClause.discount = 0;
        whereClause.discountSum = 0;
        groupInclude.required = true;
        groupInclude.on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'discount') {
        whereClause[Op.or] = [
          { discount: { [Op.ne]: 0 } },
          { discountSum: { [Op.ne]: 0 } },
        ];
      }

      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'status',
          'description',
          'createdAt',
        ],
        include: [
          groupInclude,
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
          if (!user.group || !user.group.id) return null;

          let teacher_name = 'Nomaʼlum';

          try {
            const group = await this.repoGroup.findOne({
              where: {
                id: user.group.id,
                school_id,
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
            // Quietly ignore error
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
            year: user.year,
            price: user.price,
            discount: user.discount,
            discountSum: user.discountSum,
            month: user.month,
            status: user.status,
            description: user.description,
            createdAt: user.createdAt,
          };
        }),
      );

      const filteredProducts = allProduct.filter(Boolean);

      return {
        status: 200,
        data: {
          records: filteredProducts,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
          summary: {
            paymentCount,
            halfPaymentCount,
            discountCount,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findYearHistory(
    school_id: number,
    year: number,
    status: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      const [paymentCount, halfPaymentCount, discountCount] = await Promise.all(
        [
          this.repo.count({
            where: {
              school_id,
              discount: 0,
              discountSum: 0,
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              discount: 0,
              discountSum: 0,
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              [Op.or]: [
                { discount: { [Op.ne]: 0 } },
                { discountSum: { [Op.ne]: 0 } },
              ],
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
          }),
        ],
      );

      let whereClause: any = {
        school_id,
        createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
      };

      let groupInclude: any = {
        model: Group,
        attributes: ['id', 'name', 'price'],
      };

      if (status === 'payment') {
        whereClause.discount = 0;
        whereClause.discountSum = 0;
        groupInclude.required = true;
        groupInclude.on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'halfPayment') {
        whereClause.discount = 0;
        whereClause.discountSum = 0;
        groupInclude.required = true;
        groupInclude.on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'discount') {
        whereClause[Op.or] = [
          { discount: { [Op.ne]: 0 } },
          { discountSum: { [Op.ne]: 0 } },
        ];
      }

      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'status',
          'description',
          'createdAt',
        ],
        include: [
          groupInclude,
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
          if (!user.group || !user.group.id) return null;

          let teacher_name = 'Nomaʼlum';

          try {
            const group = await this.repoGroup.findOne({
              where: {
                id: user.group.id,
                school_id,
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
            // Quietly ignore error
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
            discountSum: user.discountSum,
            month: user.month,
            year: user.year,
            status: user.status,
            description: user.description,
            createdAt: user.createdAt,
          };
        }),
      );

      const filteredProducts = allProduct.filter(Boolean);

      return {
        status: 200,
        data: {
          records: filteredProducts,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
          summary: {
            paymentCount,
            halfPaymentCount,
            discountCount,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findGroupMonthHistory(
    school_id: number,
    group_id: number,
    year: string,
    month: string,
    status: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const [paymentCount, halfPaymentCount, discountCount] = await Promise.all(
        [
          this.repo.count({
            where: {
              school_id,
              group_id,
              discount: 0,
              discountSum: 0,
              year,
              month,
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              group_id,
              discount: 0,
              discountSum: 0,
              year,
              month,
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              group_id,
              [Op.or]: [
                { discount: { [Op.ne]: 0 } },
                { discountSum: { [Op.ne]: 0 } },
              ],
              year,
              month,
            },
          }),
        ],
      );

      let whereClause: any = {
        school_id,
        group_id,
        year,
        month,
      };

      let groupInclude: any = {
        model: Group,
        attributes: ['id', 'name', 'price'],
      };

      if (status === 'payment') {
        whereClause.discount = 0;
        whereClause.discountSum = 0;
        groupInclude.required = true;
        groupInclude.on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'halfPayment') {
        whereClause.discount = 0;
        whereClause.discountSum = 0;
        groupInclude.required = true;
        groupInclude.on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'discount') {
        whereClause[Op.or] = [
          { discount: { [Op.ne]: 0 } },
          { discountSum: { [Op.ne]: 0 } },
        ];
      }

      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'status',
          'description',
          'createdAt',
        ],
        include: [
          groupInclude,
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
          if (!user.group || !user.group.id) return null;

          let teacher_name = 'Nomaʼlum';

          try {
            const group = await this.repoGroup.findOne({
              where: {
                id: user.group.id,
                school_id,
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
            // Quietly ignore error
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
            discountSum: user.discountSum,
            month: user.month,
            year: user.year,
            status: user.status,
            description: user.description,
            createdAt: user.createdAt,
          };
        }),
      );

      const filteredProducts = allProduct.filter(Boolean);

      return {
        status: 200,
        data: {
          records: filteredProducts,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
          summary: {
            paymentCount,
            halfPaymentCount,
            discountCount,
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
    status: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const startDate = new Date(year, month - 1, day);
      const endDate = new Date(year, month - 1, day + 1);

      const [paymentCount, halfPaymentCount, discountCount] = await Promise.all(
        [
          this.repo.count({
            where: {
              school_id,
              discount: 0,
              discountSum: 0,
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              discount: 0,
              discountSum: 0,
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
            include: [
              {
                model: Group,
                required: true,
                on: literal(
                  `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
                ),
              },
            ],
          }),
          this.repo.count({
            where: {
              school_id,
              [Op.or]: [
                { discount: { [Op.ne]: 0 } },
                { discountSum: { [Op.ne]: 0 } },
              ],
              createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
            },
          }),
        ],
      );

      let count = 0;
      let allUsers: any[] = [];

      const baseOptions: any = {
        where: {
          school_id,
          createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
        },
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'status',
          'description',
          'createdAt',
        ],
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
      };

      if (status === 'payment') {
        baseOptions.where.discount = 0;
        baseOptions.where.discountSum = 0;
        baseOptions.include[0].required = true;
        baseOptions.include[0].on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" = CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'halfPayment') {
        baseOptions.where.discount = 0;
        baseOptions.where.discountSum = 0;
        baseOptions.include[0].required = true;
        baseOptions.include[0].on = literal(
          `"Payment"."group_id" = "group"."id" AND "Payment"."price" != CAST("group"."price" AS INTEGER)`,
        );
      } else if (status === 'discount') {
        baseOptions.where[Op.or] = [
          { discount: { [Op.ne]: 0 } },
          { discountSum: { [Op.ne]: 0 } },
        ];
      }

      ({ count, rows: allUsers } =
        await this.repo.findAndCountAll(baseOptions));

      const total_count = count;
      const total_pages = Math.ceil(total_count / limit);

      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          if (!user.group || !user.group.id) return null;

          let teacher_name = 'Nomaʼlum';

          try {
            const group = await this.repoGroup.findOne({
              where: { id: user.group.id, school_id },
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
            // quietly fail
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
            discountSum: user.discountSum,
            month: user.month,
            year: user.year,
            status: user.status,
            description: user.description,
            createdAt: user.createdAt,
          };
        }),
      );

      const filteredProducts = allProduct.filter(Boolean);

      return {
        status: 200,
        data: {
          records: filteredProducts,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
          summary: {
            paymentCount,
            halfPaymentCount,
            discountCount,
          },
        },
      };
    } catch (error) {
      console.log(error);
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
                    where: {
                      year,
                      month,
                      group_id,
                      status: { [Op.ne]: 'delete' },
                    },
                    required: false,
                    attributes: [
                      'price',
                      'discount',
                      'discountSum',
                      'createdAt',
                    ],
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
          let discountAmount = 0;

          if (payment.discount && payment.discount > 0) {
            discountAmount = (groupPrice * payment.discount) / 100;
          } else if (payment.discountSum && payment.discountSum > 0) {
            discountAmount = payment.discountSum;
          }

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
                where: { status: true },
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
            where: { year, month, status: { [Op.ne]: 'delete' } },
            required: false,
            attributes: [
              'price',
              'discount',
              'discountSum',
              'group_id',
              'createdAt',
            ],
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
            let discountAmount = 0;

            if (payment.discount && payment.discount > 0) {
              discountAmount = (groupPrice * payment.discount) / 100;
            } else if (payment.discountSum && payment.discountSum > 0) {
              discountAmount = payment.discountSum;
            }

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

    await payment.update({
      ...updatePaymentDto,
      status: 'update',
    });

    return {
      message: 'Payment updated successfully',
      payment,
    };
  }

  async remove(id: number, school_id: number) {
    const payment = await this.findOne(id, school_id);

    await payment.update({ status: 'delete' });

    return {
      message: 'Payment marked as deleted successfully',
    };
  }

  async findEmployeeDayHistory(
    school_id: number,
    employee_id: number,
    year: number,
    month: number,
    day: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      // 1. employee qatnashgan group_id larni olish
      const employeeGroups = await this.repoGroup.findAll({
        where: { school_id },
        include: [
          {
            model: EmployeeGroup,
            where: { employee_id },
            attributes: [],
            required: true,
          },
        ],
        attributes: ['id'],
      });

      const allowedGroupIds = employeeGroups.map((g) => g.id);

      if (allowedGroupIds.length === 0) {
        return {
          status: 200,
          data: {
            records: [],
            total_sum: 0,
            pagination: {
              currentPage: page,
              total_pages: 0,
              total_count: 0,
            },
          },
        };
      }

      // 2. tolovlarni olish (faqat employee tegishli guruhlar)
      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: {
          school_id,
          group_id: { [Op.in]: allowedGroupIds },
          createdAt: {
            [Op.gte]: new Date(year, month - 1, day),
            [Op.lt]: new Date(year, month - 1, day + 1),
          },
        },
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'createdAt',
          'status',
          'description',
        ],
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

      // 3. Qayta formatlash
      let total_sum = 0;

      const allProduct = allUsers.map((user) => {
        const record = {
          id: user.id,
          student_name: user.student
            ? user.student.full_name
            : 'O‘chirilgan o‘quvchi',
          group_name: user.group?.name || 'Nomaʼlum guruh',
          group_price: user.group?.price || 0,
          method: user.method,
          price: user.price,
          discount: user.discount,
          discountSum: user.discountSum,
          month: user.month,
          year: user.year,
          status: user.status,
          description: user.description,
          createdAt: user.createdAt,
        };

        total_sum += Number(user.price || 0);

        return record;
      });

      return {
        status: 200,
        data: {
          records: allProduct,
          total_sum,
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

  async findEmployeeMonthHistory(
    school_id: number,
    employee_id: number,
    year: number,
    month: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      // 1. employee qatnashgan group_id larni olish
      const employeeGroups = await this.repoGroup.findAll({
        where: { school_id },
        include: [
          {
            model: EmployeeGroup,
            where: { employee_id },
            attributes: [],
            required: true,
          },
        ],
        attributes: ['id'],
      });

      const allowedGroupIds = employeeGroups.map((g) => g.id);

      if (allowedGroupIds.length === 0) {
        return {
          status: 200,
          data: {
            records: [],
            total_sum: 0,
            pagination: {
              currentPage: page,
              total_pages: 0,
              total_count: 0,
            },
          },
        };
      }

      // 2. tolovlarni olish (faqat employee tegishli guruhlar)
      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: {
          school_id,
          group_id: { [Op.in]: allowedGroupIds },
          createdAt: {
            [Op.gte]: new Date(year, month - 1, 1),
            [Op.lt]: new Date(year, month, 1),
          },
        },
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'createdAt',
          'status',
          'description',
        ],
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

      // 3. Qayta formatlash
      let total_sum = 0;

      const allProduct = allUsers.map((user) => {
        const record = {
          id: user.id,
          student_name: user.student
            ? user.student.full_name
            : 'O‘chirilgan o‘quvchi',
          group_name: user.group?.name || 'Nomaʼlum guruh',
          group_price: user.group?.price || 0,
          method: user.method,
          price: user.price,
          discount: user.discount,
          discountSum: user.discountSum,
          month: user.month,
          year: user.year,
          status: user.status,
          description: user.description,
          createdAt: user.createdAt,
        };

        total_sum += Number(user.price || 0);

        return record;
      });

      return {
        status: 200,
        data: {
          records: allProduct,
          total_sum,
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

  async findEmployeeYearHistory(
    school_id: number,
    employee_id: number,
    year: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      // 1. employee qatnashgan group_id larni olish
      const employeeGroups = await this.repoGroup.findAll({
        where: { school_id },
        include: [
          {
            model: EmployeeGroup,
            where: { employee_id },
            attributes: [],
            required: true,
          },
        ],
        attributes: ['id'],
      });

      const allowedGroupIds = employeeGroups.map((g) => g.id);

      if (allowedGroupIds.length === 0) {
        return {
          status: 200,
          data: {
            records: [],
            total_sum: 0,
            pagination: {
              currentPage: page,
              total_pages: 0,
              total_count: 0,
            },
          },
        };
      }

      // 2. tolovlarni olish (faqat employee tegishli guruhlar)
      const { count, rows: allUsers } = await this.repo.findAndCountAll({
        where: {
          school_id,
          group_id: { [Op.in]: allowedGroupIds },
          createdAt: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          },
        },
        attributes: [
          'id',
          'method',
          'price',
          'discount',
          'discountSum',
          'month',
          'year',
          'createdAt',
          'status',
          'description',
        ],
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

      // 3. Qayta formatlash
      let total_sum = 0;

      const allProduct = allUsers.map((user) => {
        const record = {
          id: user.id,
          student_name: user.student
            ? user.student.full_name
            : 'O‘chirilgan o‘quvchi',
          group_name: user.group?.name || 'Nomaʼlum guruh',
          group_price: user.group?.price || 0,
          method: user.method,
          price: user.price,
          discount: user.discount,
          discountSum: user.discountSum,
          month: user.month,
          year: user.year,
          status: user.status,
          description: user.description,
          createdAt: user.createdAt,
        };

        total_sum += Number(user.price || 0);

        return record;
      });

      return {
        status: 200,
        data: {
          records: allProduct,
          total_sum,
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

  async findEmployeeHistoryDebtor(
    school_id: number,
    employee_id: number,
    year: string,
    month: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const employeeGroups = await this.repoGroup.findAll({
        where: { school_id },
        include: [
          {
            model: EmployeeGroup,
            where: { employee_id },
            attributes: [],
            required: true,
          },
        ],
        attributes: ['id'],
      });

      const allowedGroupIds = employeeGroups.map((g) => g.id);

      const allStudents = await this.repoStudent.findAll({
        where: { school_id },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: StudentGroup,
            where: {
              group_id: { [Op.in]: allowedGroupIds },
            },
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
            attributes: [
              'price',
              'discount',
              'discountSum',
              'group_id',
              'createdAt',
            ],
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
            let discountAmount = 0;

            if (payment.discount && payment.discount > 0) {
              discountAmount = (groupPrice * payment.discount) / 100;
            } else if (payment.discountSum && payment.discountSum > 0) {
              discountAmount = payment.discountSum;
            }

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
}
