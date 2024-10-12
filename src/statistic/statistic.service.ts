import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from 'src/employee/models/employee.model';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';
import { Student } from 'src/student/models/student.model';
import { School } from 'src/school/models/school.model';
import { Op, fn, col, Sequelize } from 'sequelize';
import { PaymentMethod } from 'src/payment_method/models/payment_method.model';

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

  async getSchoolPayments(school_id: number) {
    const school = await this.repoSchool.findOne({
      where: { id: school_id },
    });

    if (!school) {
      throw new BadRequestException(`School with ID ${school_id} not found`);
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const yearStartDate = new Date(currentYear, 0, 1);
    yearStartDate.setHours(yearStartDate.getHours() + 5);

    const yearEndDate = new Date(currentYear, 11, 31, 23, 59, 59);
    yearEndDate.setHours(yearEndDate.getHours() + 5);

    const monthStartDate = new Date(currentYear, currentMonth - 1, 1);
    monthStartDate.setHours(monthStartDate.getHours() + 5);

    const monthEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    monthEndDate.setHours(monthEndDate.getHours() + 5);

    const weekStartDate = new Date(currentDate);
    weekStartDate.setDate(currentDate.getDate() - currentDate.getDay());
    weekStartDate.setHours(0, 0, 0, 0);
    weekStartDate.setHours(weekStartDate.getHours() + 5);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);
    weekEndDate.setHours(weekEndDate.getHours() + 5);

    const dayStartDate = new Date(currentYear, currentMonth - 1, currentDay);
    dayStartDate.setHours(dayStartDate.getHours() + 5);

    const dayEndDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      23,
      59,
      59,
    );
    dayEndDate.setHours(dayEndDate.getHours() + 5);

    const yearPaymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        createdAt: {
          [Op.between]: [yearStartDate, yearEndDate],
        },
      },
    });

    const monthPaymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        createdAt: {
          [Op.between]: [monthStartDate, monthEndDate],
        },
      },
    });

    const weekPaymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        createdAt: {
          [Op.between]: [weekStartDate, weekEndDate],
        },
      },
    });

    const dayPaymentSum = await this.repoPayment.sum('price', {
      where: {
        school_id,
        createdAt: {
          [Op.between]: [dayStartDate, dayEndDate],
        },
      },
    });

    return {
      yearPayments: yearPaymentSum || 0,
      monthPayments: monthPaymentSum || 0,
      weekPayments: weekPaymentSum || 0,
      dayPayments: dayPaymentSum || 0,
    };
  }

  async getTeacherMoneys(school_id: number, id: number) {}

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
      console.log(date);

      throw new Error(
        "Noto'g'ri sana formati. 'YYYY-MM-DD' yoki 'YYYY-MM' formatida kiriting.",
      );
    }

    startDate.setHours(startDate.getHours() + 5);
    endDate.setHours(endDate.getHours() + 5);

    const allMethods = await this.repoMethod.findAll({
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

    const paymentMethods = allMethods.reduce((acc, method) => {
      acc[method.name] = 0;
      return acc;
    }, {});

    payments.forEach((payment) => {
      const method = payment.get('method');
      const count = payment.get('count');
      paymentMethods[method] = count;
      console.log(paymentMethods);
    });

    const statistics = Object.entries(paymentMethods).map(
      ([method, count]) => ({
        method,
        count,
      }),
    );

    statistics.push({
      method: 'Tushum',
      count: paymentSum || 0,
    });

    return {
      statistics,
    };
  }
}
