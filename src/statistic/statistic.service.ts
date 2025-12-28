import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from 'src/employee/models/employee.model';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';
import { Student } from 'src/student/models/student.model';
import { School } from 'src/school/models/school.model';
import { Op, fn, col, Sequelize } from 'sequelize';
import { PaymentMethod } from 'src/payment_method/models/payment_method.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { Cost } from 'src/cost/model/cost.model';
import { Salary } from 'src/salary/models/salary.model';
import { CostCategory } from 'src/cost-category/models/cost-category.model';
import { SocialMedia } from 'src/social_media/models/social_media.model';
import { Customer } from 'src/customer/models/customer.model';

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Student) private repoStudent: typeof Student,
    @InjectModel(Employee) private repoEmployee: typeof Employee,
    @InjectModel(Group) private repoGroup: typeof Group,
    @InjectModel(Payment) private repoPayment: typeof Payment,
    @InjectModel(School) private repoSchool: typeof School,
    @InjectModel(PaymentMethod) private repoMethod: typeof PaymentMethod,
    @InjectModel(EmployeeGroup) private employeeGroupRepo: typeof EmployeeGroup,
    @InjectModel(StudentGroup) private studentGroupRepo: typeof StudentGroup,
    @InjectModel(Cost) private costRepo: typeof Cost,
    @InjectModel(Salary) private salaryRepo: typeof Salary,
    @InjectModel(CostCategory) private categoryRepo: typeof CostCategory,
    @InjectModel(SocialMedia) private repoSocial: typeof SocialMedia,
    @InjectModel(Customer) private repoCustomer: typeof Customer,
  ) {}

  async getSchoolStatistics(school_id: number) {
    const school = await this.repoSchool.findOne({
      where: { id: school_id },
    });

    if (!school) {
      throw new BadRequestException(`School with ID ${school_id} not found`);
    }

    const studentCount = await this.repoStudent.count({
      where: { school_id },
    });

    const employeeCount = await this.repoEmployee.count({
      where: { school_id },
    });

    const groupCount = await this.repoGroup.count({
      where: { school_id, status: true },
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    startDate.setHours(startDate.getHours() + 5);

    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    endDate.setHours(endDate.getHours() + 5);

    const paymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    return {
      student_number: studentCount,
      employee_number: employeeCount,
      group_number: groupCount,
      payment_sum: paymentSum || 0,
    };
  }

  async getDayPayments(school_id: number, date: string) {
    let startDate: Date;
    let endDate: Date;

    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      startDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
      );
      endDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
        23,
        59,
        59,
      );
    } else if (dateParts.length === 2) {
      startDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, 1);
      endDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]),
        0,
        23,
        59,
        59,
      );
    } else {
      throw new Error(
        "Noto'g'ri sana formati. 'YYYY-MM-DD' yoki 'YYYY-MM' formatida kiriting.",
      );
    }

    startDate.setHours(startDate.getHours());
    endDate.setHours(endDate.getHours());

    const allMethods = await this.repoMethod.findAll({
      where: {
        school_id,
      },
      attributes: ['name'],
    });

    const payments = await this.repoPayment.findAll({
      where: {
        school_id,
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'method',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
      ],
      group: ['method'],
    });

    const paymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const paymentMethods = allMethods.reduce(
      (acc, method) => {
        acc[method.name] = { count: 0, sum: 0 };
        return acc;
      },
      {} as Record<string, { count: number; sum: number }>,
    );

    payments.forEach((payment) => {
      const method = payment.get('method');
      const count = payment.get('count');
      const sum = payment.get('sum');
      paymentMethods[method] = { count: Number(count), sum: Number(sum) };
    });

    let totalCount = 0;
    const statistics = Object.entries(paymentMethods).map(
      ([method, { count, sum }]) => {
        totalCount += count;
        return {
          method,
          count,
          sum,
        };
      },
    );

    statistics.push({
      method: 'Tushum',
      count: totalCount,
      sum: paymentSum || 0,
    });

    return {
      statistics,
    };
  }

  async getDayPaymentsGroup(school_id: number, group_id: number, date: string) {
    let startDate: Date;
    let endDate: Date;

    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      startDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
      );
      endDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
        23,
        59,
        59,
      );
    } else if (dateParts.length === 2) {
      startDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, 1);
      endDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]),
        0,
        23,
        59,
        59,
      );
    } else {
      throw new Error(
        "Noto'g'ri sana formati. 'YYYY-MM-DD' yoki 'YYYY-MM' formatida kiriting.",
      );
    }

    startDate.setHours(startDate.getHours());
    endDate.setHours(endDate.getHours());

    const allMethods = await this.repoMethod.findAll({
      where: {
        school_id,
      },
      attributes: ['name'],
    });

    const payments = await this.repoPayment.findAll({
      where: {
        school_id,
        group_id,
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'method',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
      ],
      group: ['method'],
    });

    const paymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        group_id,
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const paymentMethods = allMethods.reduce(
      (acc, method) => {
        acc[method.name] = { count: 0, sum: 0 };
        return acc;
      },
      {} as Record<string, { count: number; sum: number }>,
    );

    payments.forEach((payment) => {
      const method = payment.get('method');
      const count = payment.get('count');
      const sum = payment.get('sum');
      paymentMethods[method] = { count: Number(count), sum: Number(sum) };
    });

    let totalCount = 0;
    const statistics = Object.entries(paymentMethods).map(
      ([method, { count, sum }]) => {
        totalCount += count;
        return {
          method,
          count,
          sum,
        };
      },
    );

    statistics.push({
      method: 'Tushum',
      count: totalCount,
      sum: paymentSum || 0,
    });

    return {
      statistics,
    };
  }

  async getEmployeeDayPayments(
    school_id: number,
    employee_id: number,
    date: string,
  ) {
    let startDate: Date;
    let endDate: Date;

    const employeeGroups = await this.employeeGroupRepo.findAll({
      where: { employee_id },
      attributes: ['group_id'],
    });

    const groupIds = employeeGroups.map((eg) => eg.group_id);

    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      startDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
      );
      endDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2]),
        23,
        59,
        59,
      );
    } else if (dateParts.length === 2) {
      startDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, 1);
      endDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]),
        0,
        23,
        59,
        59,
      );
    } else {
      throw new Error(
        "Noto'g'ri sana formati. 'YYYY-MM-DD' yoki 'YYYY-MM' formatida kiriting.",
      );
    }

    startDate.setHours(startDate.getHours());
    endDate.setHours(endDate.getHours());

    const allMethods = await this.repoMethod.findAll({
      where: {
        school_id,
      },
      attributes: ['name'],
    });

    if (groupIds.length === 0) {
      return {
        statistics: allMethods
          .map((method) => ({
            method: method.name,
            count: 0,
            sum: 0,
          }))
          .concat([{ method: 'Tushum', count: 0, sum: 0 }]),
      };
    }

    const payments = await this.repoPayment.findAll({
      where: {
        school_id,
        group_id: { [Op.in]: groupIds },
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'method',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
      ],
      group: ['method'],
    });

    const paymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        group_id: { [Op.in]: groupIds },
        status: {
          [Op.ne]: 'delete',
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const paymentMethods = allMethods.reduce(
      (acc, method) => {
        acc[method.name] = { count: 0, sum: 0 };
        return acc;
      },
      {} as Record<string, { count: number; sum: number }>,
    );

    payments.forEach((payment) => {
      const method = payment.get('method');
      const count = payment.get('count');
      const sum = payment.get('sum');
      paymentMethods[method] = { count: Number(count), sum: Number(sum) };
    });

    let totalCount = 0;
    const statistics = Object.entries(paymentMethods).map(
      ([method, { count, sum }]) => {
        totalCount += count;
        return {
          method,
          count,
          sum,
        };
      },
    );

    statistics.push({
      method: 'Tushum',
      count: totalCount,
      sum: paymentSum || 0,
    });

    return {
      statistics,
    };
  }

  async getYearlyPayments(school_id: number, year: number) {
    const currentYear = year;
    const paymentsPerMonth = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      startDate.setHours(startDate.getHours() + 5);

      const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);
      endDate.setHours(endDate.getHours() + 5);

      const paymentSum = await this.repoPayment.sum('price', {
        where: {
          school_id,
          status: {
            [Op.ne]: 'delete',
          },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      paymentsPerMonth.push(paymentSum || 0); // Massivga qo‘shish
    }

    return {
      year: currentYear,
      PaymentStats: paymentsPerMonth,
    };
  }

  async studentPayments(school_id: number, month: string) {
    try {
      const currentYear = new Date().getFullYear();

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
              },
            ],
          },
          {
            model: Payment,
            where: {
              year: String(currentYear),
              month,
              status: { [Op.ne]: 'delete' },
            },
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

      let noPayment = 0;
      let halfPayment = 0;
      let fullPayment = 0;

      for (const student of allStudents) {
        for (const studentGroup of student.group) {
          const group = studentGroup.group;
          const groupId = group.id;
          const groupPrice = Number(group.price);

          
          const joinedDate = new Date(studentGroup.createdAt);
          const checkDate = new Date(`${currentYear}-${month}-01`);
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
          

          const payments = student.payment.filter(
            (p) => p.group_id === groupId,
          );

          let totalPaid = 0;
          let totalDiscount = 0;

          for (const payment of payments) {
            let discountAmount = 0;

            if (payment.discount && payment.discount > 0) {
              discountAmount = (groupPrice * payment.discount) / 100;
            } else if (payment.discountSum && payment.discountSum > 0) {
              discountAmount = payment.discountSum;
            }

            totalPaid += payment.price;
            totalDiscount += discountAmount;
          }

          const remainingDebt = Math.max(
            groupPrice - (totalPaid + totalDiscount),
            0,
          );

          if (remainingDebt === groupPrice) {
            noPayment++;
          } else if (remainingDebt > 0) {
            halfPayment++;
          } else {
            fullPayment++;
          }
        }
      }

      return {
        status: 200,
        studentPayments: {
          noPayment,
          halfPayment,
          fullPayment,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTeacherStudentPaymentsByYear(
    school_id: number,
    employee_id: number,
    year: number,
  ) {
    const paymentsPerMonth = [];

    const employee = await this.repoEmployee.findOne({
      where: { id: employee_id, school_id },
      attributes: ['salary'],
    });

    if (!employee) {
      throw new Error('Employee topilmadi');
    }

    const percent = employee.salary || 0;

    const employeeGroups = await this.employeeGroupRepo.findAll({
      where: { employee_id },
      attributes: ['group_id'],
    });
    const groupIds = employeeGroups.map((eg) => eg.group_id);

    if (groupIds.length === 0) {
      return {
        year,
        PaymentStats: Array(12).fill(0),
      };
    }

    const studentGroups = await this.studentGroupRepo.findAll({
      where: {
        group_id: { [Op.in]: groupIds },
      },
      attributes: ['student_id'],
    });
    const studentIds = studentGroups.map((sg) => sg.student_id);

    if (studentIds.length === 0) {
      return {
        year,
        PaymentStats: Array(12).fill(0),
      };
    }

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      startDate.setHours(startDate.getHours() + 5);

      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      endDate.setHours(endDate.getHours() + 5);

      const paymentSum = await this.repoPayment.sum('price', {
        where: {
          school_id,
          group_id: { [Op.in]: groupIds },
          status: {
            [Op.ne]: 'delete',
          },
          createdAt: { [Op.between]: [startDate, endDate] },
        },
      });

      const teacherShare =
        percent === 0 ? paymentSum || 0 : ((paymentSum || 0) * percent) / 100;
      paymentsPerMonth.push(teacherShare);
    }

    return {
      year,
      PaymentStats: paymentsPerMonth,
    };
  }

  async getTeacherStudentPayments(
    school_id: number,
    employee_id: number,
    month: string,
  ) {
    try {
      const currentYear = new Date().getFullYear();

      const employeeGroups = await this.employeeGroupRepo.findAll({
        where: { employee_id },
        attributes: ['group_id'],
      });
      const groupIds = employeeGroups.map((eg) => eg.group_id);

      if (groupIds.length === 0) {
        return {
          status: 200,
          studentPayments: {
            noPayment: 0,
            halfPayment: 0,
            fullPayment: 0,
          },
        };
      }

      const studentGroups = await this.studentGroupRepo.findAll({
        where: {
          group_id: { [Op.in]: groupIds },
        },
        attributes: ['student_id', 'group_id'],
      });

      const studentGroupMap = studentGroups.map((sg) => ({
        student_id: sg.student_id,
        group_id: sg.group_id,
      }));

      const studentIds = [...new Set(studentGroups.map((sg) => sg.student_id))];

      const allStudents = await this.repoStudent.findAll({
        where: {
          id: { [Op.in]: studentIds },
          school_id,
        },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: Payment,
            where: {
              year: String(currentYear),
              month,
              status: {
                [Op.ne]: 'delete',
              },
            },
            required: false,
            attributes: ['price', 'discount', 'discountSum', 'group_id'],
          },
        ],
      });

      const groupPrices = await this.repoGroup.findAll({
        where: {
          id: { [Op.in]: groupIds },
        },
        attributes: ['id', 'price'],
      });

      const groupPriceMap = groupPrices.reduce((acc, group) => {
        acc[group.id] = Number(group.price);
        return acc;
      }, {});

      let noPayment = 0;
      let halfPayment = 0;
      let fullPayment = 0;

      for (const student of allStudents) {
        const studentGroupsForThisStudent = studentGroupMap.filter(
          (sg) => sg.student_id === student.id,
        );

        for (const sg of studentGroupsForThisStudent) {
          const groupId = sg.group_id;
          const groupPrice = groupPriceMap[groupId] || 0;

          const payments = student.payment.filter(
            (p) => p.group_id === groupId,
          );

          let totalPaid = 0;
          let totalDiscount = 0;

          for (const payment of payments) {
            let discountAmount = 0;

            if (payment.discount && payment.discount > 0) {
              discountAmount = (groupPrice * payment.discount) / 100;
            } else if (payment.discountSum && payment.discountSum > 0) {
              discountAmount = payment.discountSum;
            }

            totalPaid += payment.price;
            totalDiscount += discountAmount;
          }

          const remainingDebt = Math.max(
            groupPrice - (totalPaid + totalDiscount),
            0,
          );

          if (remainingDebt === groupPrice) {
            noPayment++;
          } else if (remainingDebt > 0) {
            halfPayment++;
          } else {
            fullPayment++;
          }
        }
      }

      return {
        status: 200,
        studentPayments: {
          noPayment,
          halfPayment,
          fullPayment,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getEmployeeStats(school_id: number, employee_id: number) {
    const employee = await this.repoEmployee.findOne({
      where: { id: employee_id, school_id },
      attributes: ['salary'],
    });

    if (!employee) {
      throw new Error('Employee topilmadi');
    }

    const salaryPercent = employee.salary || 0;

    const employeeGroups = await this.employeeGroupRepo.findAll({
      where: { employee_id },
      attributes: ['group_id'],
    });
    const groupIds = employeeGroups.map((eg) => eg.group_id);
    const groupCount = groupIds.length;

    const studentGroups = await this.studentGroupRepo.findAll({
      where: {
        group_id: { [Op.in]: groupIds },
      },
      attributes: ['student_id'],
    });
    const studentIds = [...new Set(studentGroups.map((sg) => sg.student_id))];
    const studentCount = studentIds.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    startOfMonth.setHours(startOfMonth.getHours() + 5);
    endOfMonth.setHours(endOfMonth.getHours() + 5);

    const totalPayment = await this.repoPayment.sum('price', {
      where: {
        school_id,
        status: {
          [Op.ne]: 'delete',
        },
        group_id: { [Op.in]: groupIds },
        student_id: { [Op.in]: studentIds },
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const teacherShare = ((totalPayment || 0) * salaryPercent) / 100;

    return {
      group_number: groupCount,
      student_number: studentCount,
      payment_sum: teacherShare || totalPayment,
    };
  }

  async getFinanceStatistics(school_id: number) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    startDate.setHours(startDate.getHours() + 5);

    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    endDate.setHours(endDate.getHours() + 5);

    const costSum = await this.costRepo.sum('price', {
      where: {
        school_id,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const salarySum = await this.salaryRepo.sum('price', {
      where: {
        school_id,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const allCategories = await this.categoryRepo.findAll({
      where: {
        school_id,
      },
      attributes: ['id', 'name'],
    });

    const costGrouped = await this.costRepo.findAll({
      where: {
        school_id,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'category_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
      ],
      group: ['category_id'],
    });

    const costCategories = allCategories.reduce(
      (acc, cat) => {
        acc[cat.id] = {
          category_id: cat.id,
          name: cat.name,
          count: 0,
          sum: 0,
        };
        return acc;
      },
      {} as Record<
        number,
        { category_id: number; name: string; count: number; sum: number }
      >,
    );

    costGrouped.forEach((row) => {
      const category_id = row.get('category_id') as number;
      const count = Number(row.get('count'));
      const sum = Number(row.get('sum'));

      if (costCategories[category_id]) {
        costCategories[category_id].count = count;
        costCategories[category_id].sum = sum;
      }
    });

    const cost_by_category = Object.values(costCategories);

    cost_by_category.push(
      {
        category_id: null,
        name: 'Chiqimlar',
        count: null,
        sum: costSum || 0,
      },
      {
        category_id: null,
        name: 'Maoshlar',
        count: null,
        sum: salarySum || 0,
      },
    );

    return {
      statistic: cost_by_category,
    };
  }

  async getCustomerStatistics(school_id: number, date: string) {
    let startDate: Date;
    let endDate: Date;

    const parts = date.split('-');

    // YYYY-MM
    if (parts.length === 2) {
      const [y, m] = parts.map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0, 23, 59, 59);
    }
    // YYYY
    else if (parts.length === 1) {
      const y = Number(parts[0]);
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 11, 31, 23, 59, 59);
    } else {
      throw new Error(
        "Kunlik statistika yo‘q. Faqat 'YYYY' yoki 'YYYY-MM' format bo'lishi kerak.",
      );
    }

    const allSocial = await this.repoSocial.findAll({
      where: { school_id },
      attributes: ['name'],
    });

    const customers = await this.repoCustomer.findAll({
      where: {
        school_id,
        is_student: false,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['id'],
      include: [{ model: SocialMedia, attributes: ['name'] }],
    });

    const socialStats = allSocial.reduce(
      (acc, s) => {
        acc[s.name] = { count: 0 };
        return acc;
      },
      {} as Record<string, { count: number }>,
    );

    customers.forEach((customer) => {
      const social = customer.social_media?.name || 'Noma’lum';
      if (!socialStats[social]) socialStats[social] = { count: 0 };
      socialStats[social].count++;
    });

    let total = 0;
    const statistics = Object.entries(socialStats).map(
      ([social, { count }]) => {
        total += count;
        return { social, count };
      },
    );

    statistics.push({ social: 'Umumiy', count: total });

    return { statistics };
  }
}
