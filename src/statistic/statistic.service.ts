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

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Student) private repoStudent: typeof Student,
    @InjectModel(Employee) private repoEmployee: typeof Employee,
    @InjectModel(Group) private repoGroup: typeof Group,
    @InjectModel(Payment) private repoPayment: typeof Payment,
    @InjectModel(School) private repoSchool: typeof School,
    @InjectModel(PaymentMethod) private repoMethod: typeof PaymentMethod,
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
      where: { school_id },
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
            attributes: ['group_id'],
            include: [
              {
                model: Group,
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
          {
            model: Payment,
            where: { year: String(currentYear), month },
            required: false,
            attributes: ['price', 'discount', 'group_id', 'createdAt'],
          },
        ],
      });

      let noPayment = 0; // 100% qarzdorlar soni
      let halfPayment = 0; // Qisman qarzdorlar soni
      let fullPayment = 0; // Qarzdor emaslar soni

      for (const student of allStudents) {
        for (const studentGroup of student.group) {
          const group = studentGroup.group;
          const groupId = group.id;
          const groupPrice = Number(group.price);

          const payments = student.payment.filter(
            (p) => p.group_id === groupId,
          );

          let totalPaid = 0;
          let totalDiscount = 0;

          for (const payment of payments) {
            const discountAmount = (groupPrice * (payment.discount || 0)) / 100;
            totalPaid += payment.price;
            totalDiscount += discountAmount;
          }

          const remainingDebt = Math.max(
            groupPrice - (totalPaid + totalDiscount),
            0,
          );

          // Qarzdorlik holatlarini tekshirish
          if (remainingDebt === groupPrice) {
            // 100% qarzdor
            noPayment++;
          } else if (remainingDebt > 0) {
            // Qisman qarzdor
            halfPayment++;
          } else {
            // Qarzdor emas
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
}
