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
import * as XLSX from 'xlsx';
import { Response } from 'express';
import { StatisticService } from 'src/statistic/statistic.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment) private repo: typeof Payment,
    @InjectModel(Student) private repoStudent: typeof Student,
    @InjectModel(Group) private repoGroup: typeof Group,
    @InjectModel(Employee) private repoEmployee: typeof Employee,
    private statistic: StatisticService,
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
  
  async findOne(id: number, school_id: number) {
    const payment = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: [
        { model: Student, attributes: ['id', 'full_name'] },
        {
          model: Group,
          attributes: ['id', 'name', 'price'],
          include: [
            {
              model: EmployeeGroup,
              attributes: ['id'],
              include: [{ model: Employee, attributes: ['full_name'] }],
            },
          ],
        },
      ],
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

  async findGroupStudent(school_id: number, group_id: number) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

    const students = await this.repoStudent.findAll({
      where: { school_id, status: true },
      attributes: ['id', 'full_name'],
      include: [
        {
          model: StudentGroup,
          where: { group_id },
          attributes: ['id'],
          include: [
            {
              model: Group,
              attributes: ['id', 'price', 'name', 'start_date'],
              include: [
                {
                  model: EmployeeGroup,
                  include: [{ model: Employee, attributes: ['full_name'] }],
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          where: {
            status: { [Op.ne]: 'delete' },
            group_id,
            year: String(currentYear),
            month: String(currentMonth),
          },
          required: false,
          attributes: ['price', 'discount', 'discountSum'],
        },
      ],
    });

    const result = students.map((student) => {
      const groupPrice = Number(student.group[0].group.price);

      const groupPayments = student.payment || [];
      let discountedPrice = groupPrice;

      if (groupPayments.length > 0) {
        const totalDiscount = groupPayments.reduce(
          (sum, p) => sum + (Number(p.discount) || 0),
          0,
        );
        discountedPrice = Math.round(groupPrice * (1 - totalDiscount / 100));

        const totalDiscountSum = groupPayments.reduce(
          (sum, p) => sum + (Number(p.discountSum) || 0),
          0,
        );
        discountedPrice = discountedPrice - totalDiscountSum;
      }

      const currentMonthPaid = groupPayments.reduce(
        (sum, p) => sum + Number(p.price),
        0,
      );

      const debt =
        currentMonthPaid >= discountedPrice
          ? "To'langan"
          : `(${(discountedPrice - currentMonthPaid).toLocaleString('uz-UZ')}) so'm to'lanmagan`;

      return {
        student_id: student.id,
        student_name: student.full_name,
        group_id: student.group[0].group.id,
        group_name: student.group[0].group.name,
        group_price: student.group[0].group.price,
        group_start_date: student.group[0].group.start_date,
        teacher_name: student.group[0].group.employee[0].employee.full_name,
        debt,
      };
    });

    return [result];
  }

  async findStudentGroup(school_id: number, student_id: number) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

    const students = await this.repoStudent.findAll({
      where: { school_id, id: student_id, status: true },
      attributes: ['id', 'full_name'],
      include: [
        {
          model: StudentGroup,
          include: [
            {
              model: Group,
              attributes: ['id', 'price', 'name', 'start_date'],
              include: [
                {
                  model: EmployeeGroup,
                  include: [{ model: Employee, attributes: ['full_name'] }],
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          where: {
            status: { [Op.ne]: 'delete' },
            year: String(currentYear),
            month: String(currentMonth),
          },
          required: false,
          attributes: ['group_id', 'price', 'discount', 'discountSum'],
        },
      ],
    });

    const result = students.flatMap((student) => {
      return student.group.map((studentGroup) => {
        const group = studentGroup.group;
        const groupPrice = Number(group.price);

        const groupPayments = (student.payment || []).filter(
          (p) => p.group_id === group.id,
        );

        let discountedPrice = groupPrice;
        if (groupPayments.length > 0) {
          const totalDiscount = groupPayments.reduce(
            (sum, p) => sum + (Number(p.discount) || 0),
            0,
          );
          discountedPrice = Math.round(groupPrice * (1 - totalDiscount / 100));

          const totalDiscountSum = groupPayments.reduce(
            (sum, p) => sum + (Number(p.discountSum) || 0),
            0,
          );
          discountedPrice = discountedPrice - totalDiscountSum;
        }

        const currentMonthPaid = groupPayments.reduce(
          (sum, p) => sum + p.price,
          0,
        );

        const debt =
          currentMonthPaid >= discountedPrice
            ? "To'langan"
            : `(${(discountedPrice - currentMonthPaid).toLocaleString('uz-UZ')}) so'm to'lanmagan`;

        return {
          student_id: student.id,
          student_name: student.full_name,
          group_id: group.id,
          group_name: group.name,
          group_price: group.price,
          group_start_date: group.start_date,
          teacher_name: group.employee[0].employee.full_name,
          debt,
        };
      });
    });

    return result;
  }

  async excelHistory(
    school_id: number,
    year?: number,
    month?: number,
    day?: number,
    group_id?: number,
    res?: Response,
  ) {
    try {
      const whereCondition: any = { school_id };
      let statisticData: any = [];
      if (group_id) {
        if (!month || !year) {
          throw new BadRequestException(
            'group_id berilganda month va year majburiy',
          );
        }
        statisticData = await this.statistic.getDayPaymentsGroup(
          school_id,
          group_id,
          `${year}-${month}`,
        );
        whereCondition.group_id = group_id;
        whereCondition.month = month;
        whereCondition.year = year;
      } else {
        let startDate: Date;
        let endDate: Date;

        if (year && month && day) {
          startDate = new Date(year, month - 1, day);
          endDate = new Date(year, month - 1, day + 1);
          statisticData = await this.statistic.getDayPayments(
            school_id,
            `${year}-${month}-${day}`,
          );
        } else if (year && month) {
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 1);
          statisticData = await this.statistic.getDayPayments(
            school_id,
            `${year}-${month}`,
          );
        } else if (year) {
          startDate = new Date(year, 0, 1);
          endDate = new Date(year + 1, 0, 1);
        } else {
          throw new BadRequestException(
            'Kamida year parametri berilishi kerak',
          );
        }

        whereCondition.createdAt = { [Op.gte]: startDate, [Op.lt]: endDate };
      }

      const allUsers = await this.repo.findAll({
        where: whereCondition,
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
      });

      if (!allUsers || allUsers.length === 0) {
        throw new BadRequestException("Ma'lumotlar topilmadi");
      }

      const excelData: any[] = [];

      const uniqueGroupIds = [
        ...new Set(allUsers.map((u) => u.group?.id).filter(Boolean)),
      ];

      const groupsWithTeachers = await this.repoGroup.findAll({
        where: {
          id: { [Op.in]: uniqueGroupIds },
          school_id,
        },
        include: [
          {
            model: EmployeeGroup,
            attributes: ['employee_id'],
            include: [
              {
                model: Employee,
                attributes: ['full_name'],
              },
            ],
          },
        ],
      });

      const teacherMap = new Map<number, string>();
      groupsWithTeachers.forEach((group) => {
        const teacherName =
          group.employee?.[0]?.employee?.full_name || 'Nomaʼlum';
        teacherMap.set(group.id, teacherName);
      });

      for (const user of allUsers) {
        const teacher_name = user.group?.id
          ? teacherMap.get(user.group.id) || 'Nomaʼlum'
          : 'Nomaʼlum';

        const statusText =
          user.status === 'delete'
            ? "O'chirilgan"
            : user.status === 'update'
              ? "O'zgartirilgan"
              : 'Tasdiqlangan';

        excelData.push({
          "O'quvchi (F . I . O)": user.student
            ? user.student.full_name
            : "O'chirilgan o'quvchi",
          "O'qituvchi (F . I . O)": teacher_name,
          'Guruh nomi': user.group?.name || 'N/A',
          'Guruh narxi':
            Number(user.group?.price || 0).toLocaleString('uz-UZ') + " so'm",
          "To'lov turi": user.method,
          "To'langan summa": user.price,
          'Chegirma (%)': user.discount + ' %',
          Yil: user.year + ' yil',
          Oy: this.monthNames(Number(user.month)),
          "To'lov sanasi": this.formatDate(user.createdAt),
          Izoh: user.description || '',
          Holati: statusText,
        });
      }

      if (statisticData?.statistics?.length) {
        excelData.push({});
        excelData.push({});
        excelData.push({});

        excelData.push({
          "O'quvchi (F . I . O)": "To'lov turi",
          "O'qituvchi (F . I . O)": "To'lovlar soni",
          'Guruh nomi': 'Jami summa',
        });

        for (const stat of statisticData.statistics) {
          excelData.push({
            "O'quvchi (F . I . O)": stat.method,
            "O'qituvchi (F . I . O)":
              Number(stat.count).toLocaleString('uz-UZ') + ' ta',
            'Guruh nomi':
              Number(stat.sum || stat.total || 0).toLocaleString('uz-UZ') +
              " so'm",
          });
        }
      }

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      const worksheet = this.createWorksheet(excelData);

      worksheet['!cols'] = [
        { wch: 25 }, // O'quvchi (F . I . O)
        { wch: 25 }, // O'qituvchi (F . I . O)
        { wch: 20 }, // Guruh nomi
        { wch: 20 }, // Guruh narxi
        { wch: 15 }, // To'lov turi
        { wch: 15 }, // To'langan summa
        { wch: 15 }, // Chegirma (%)
        { wch: 10 }, // Yil
        { wch: 12 }, // Oy
        { wch: 15 }, // To'lov sanasi
        { wch: 30 }, // Izoh
        { wch: 15 }, // Holati
      ];

      let sheetName = "To'lovlar";
      if (group_id) {
        const groupName = allUsers[0]?.group?.name || 'Guruh';
        sheetName = `${groupName} - ${this.monthNames(month)} ${year}`;
      } else if (year && month && day) {
        sheetName = `${day} ${this.monthNames(month)} ${year}`;
      } else if (year && month) {
        sheetName = `${this.monthNames(month)} ${year}`;
      } else if (year) {
        sheetName = `${year} yil`;
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer: Buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      }) as Buffer;

      let fileName = 'payment_history';
      if (group_id) {
        fileName = `payment_history_group_${group_id}_${month}_${year}.xlsx`;
      } else if (year && month && day) {
        fileName = `payment_history_${day}_${month}_${year}.xlsx`;
      } else if (year && month) {
        fileName = `payment_history_${month}_${year}.xlsx`;
      } else if (year) {
        fileName = `payment_history_${year}.xlsx`;
      }

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      return res.send(excelBuffer);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        error.message || 'Excel faylni yaratishda xatolik yuz berdi',
      );
    }
  }

  async excelTeacherHistory(
    school_id: number,
    employee_id: number,
    year?: number,
    month?: number,
    day?: number,
    res?: Response,
  ) {
    try {
      let allowedGroupIds = [];
      let statisticData: any = [];

      if (employee_id) {
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

        allowedGroupIds = employeeGroups.map((g) => g.id);
      }

      if (!allowedGroupIds.length) {
        throw new BadRequestException("Ma'lumot topilmadi");
      }

      const whereCondition: any = {
        school_id,
        group_id: { [Op.in]: allowedGroupIds },
      };

      if (year && month && day) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, month - 1, day),
          [Op.lt]: new Date(year, month - 1, day + 1),
        };
        statisticData = await this.statistic.getEmployeeDayPayments(
          school_id,
          employee_id,
          `${year}-${month}-${day}`,
        );
      } else if (year && month) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1),
        };
        statisticData = await this.statistic.getEmployeeDayPayments(
          school_id,
          employee_id,
          `${year}-${month}`,
        );
      } else if (year) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1),
        };
      }

      const allUsers = await this.repo.findAll({
        where: whereCondition,
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
          { model: Group, attributes: ['id', 'name', 'price'] },
          { model: Student, attributes: ['full_name'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      if (!allUsers.length) {
        throw new BadRequestException("Ma'lumot topilmadi");
      }

      const teacherName = employee_id
        ? (await this.repoEmployee.findByPk(employee_id))?.full_name ||
          'Nomaʼlum'
        : 'Nomaʼlum';

      const excelData: any[] = [];

      for (const user of allUsers) {
        const statusText =
          user.status === 'delete'
            ? "O'chirilgan"
            : user.status === 'update'
              ? "O'zgartirilgan"
              : 'Tasdiqlangan';

        excelData.push({
          "O'quvchi (F . I . O)":
            user.student?.full_name || "O'chirilgan o'quvchi",
          "O'qituvchi (F . I . O)": teacherName,
          'Guruh nomi': user.group?.name || 'N/A',
          'Guruh narxi':
            Number(user.group?.price || 0).toLocaleString('uz-UZ') + " so'm",
          "To'lov turi": user.method,
          "To'langan summa": user.price,
          'Chegirma (%)': user.discount + ' %',
          Yil: user.year + ' yil',
          Oy: this.monthNames(Number(user.month)),
          "To'lov sanasi": this.formatDate(user.createdAt),
          Izoh: user.description || '',
          Holati: statusText,
        });
      }

      if (statisticData?.statistics?.length) {
        excelData.push({});
        excelData.push({});
        excelData.push({});

        excelData.push({
          "O'quvchi (F . I . O)": "To'lov turi",
          "O'qituvchi (F . I . O)": "To'lovlar soni",
          'Guruh nomi': 'Jami summa',
        });

        for (const stat of statisticData.statistics) {
          excelData.push({
            "O'quvchi (F . I . O)": stat.method,
            "O'qituvchi (F . I . O)":
              Number(stat.count).toLocaleString('uz-UZ') + ' ta',
            'Guruh nomi':
              Number(stat.sum || stat.total || 0).toLocaleString('uz-UZ') +
              " so'm",
          });
        }
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = this.createWorksheet(excelData);

      worksheet['!cols'] = [
        { wch: 25 }, // O'quvchi (F . I . O)
        { wch: 25 }, // O'qituvchi (F . I . O)
        { wch: 20 }, // Guruh nomi
        { wch: 20 }, // Guruh narxi
        { wch: 15 }, // To'lov turi
        { wch: 15 }, // To'langan summa
        { wch: 15 }, // Chegirma (%)
        { wch: 10 }, // Yil
        { wch: 12 }, // Oy
        { wch: 15 }, // To'lov sanasi
        { wch: 30 }, // Izoh
        { wch: 15 }, // Holati
      ];

      const sheetName = year
        ? month
          ? day
            ? `${day}.${month}.${year}`
            : `${month}.${year}`
          : `${year}`
        : 'Data';

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileName = `teacher_all_${sheetName}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      return res.send(
        XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async exportDebtorExcel(
    school_id: number,
    year: string,
    month: string,
    res: Response,
    options?: { group_id?: number; employee_id?: number },
  ) {
    try {
      const { group_id, employee_id } = options || {};

      // 1️⃣ Barcha studentlarni olish
      const allStudents = await this.repoStudent.findAll({
        where: { school_id },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: StudentGroup,
            where: group_id ? { group_id } : {},
            attributes: ['group_id', 'createdAt'],
            include: [
              {
                model: Group,
                attributes: ['id', 'name', 'price'],
                where: { status: true },
                include: [
                  {
                    model: EmployeeGroup,
                    where: employee_id ? { employee_id } : {},
                    attributes: ['employee_id'],
                    required: employee_id ? true : false,
                    include: [
                      { model: Employee, attributes: ['id', 'full_name'] },
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

      const debtors: any[] = [];

      for (const student of allStudents) {
        for (const studentGroup of student.group) {
          const group = studentGroup.group;
          const groupPrice = Number(group.price);
          const groupId = group.id;

          const joinedDate = new Date(studentGroup.createdAt);
          const checkDate = new Date(`${year}-${month}-01`);

          if (
            joinedDate.getFullYear() > checkDate.getFullYear() ||
            (joinedDate.getFullYear() === checkDate.getFullYear() &&
              joinedDate.getMonth() > checkDate.getMonth())
          )
            continue;

          const teacher = group.employee?.[0]?.employee;
          const teacherName = teacher
            ? teacher.full_name
            : 'Noma’lum o‘qituvchi';

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

          if (remainingDebt > 0) {
            debtors.push({
              id: student.id,
              student_name: student.full_name,
              group_id: groupId,
              group_name: group.name,
              teacher_name: teacherName,
              group_price: groupPrice,
              debt: remainingDebt,
            });
          }
        }
      }

      const excelData = debtors.map((item) => ({
        "O'quvchi (F . I . O)": item.student_name,
        "O'qituvchi (F . I . O)": item.teacher_name,
        'Guruh nomi': item.group_name,
        'Guruh narxi':
          Number(item.group_price).toLocaleString('uz-UZ') + " so'm",
        'Qarzdorlik suma': Number(item.debt).toLocaleString('uz-UZ') + " so'm",
      }));

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      worksheet['!cols'] = [
        { wch: 25 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
      ];

      let sheetName = 'Qarzdorlar';
      if (group_id) {
        const groupName = allStudents[0]?.group?.[0]?.group?.name || 'Guruh';
        sheetName = `${groupName} - ${month} ${year}`;
      } else if (year && month) {
        sheetName = `${year} ${month}`;
      } else if (year) {
        sheetName = `${year} yil`;
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      let fileName = 'debtor_history.xlsx';
      if (group_id) {
        fileName = `debtor_group_${year}_${month}.xlsx`;
      } else if (employee_id) {
        fileName = `debtor_employee_${employee_id}_${year}_${month}.xlsx`;
      } else if (year && month) {
        fileName = `debtor_${year}_${month}.xlsx`;
      } else if (year) {
        fileName = `debtor_${year}.xlsx`;
      }

      const excelBuffer: Buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      }) as Buffer;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      return res.send(excelBuffer);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        error.message || 'Excel faylni yaratishda xatolik yuz berdi',
      );
    }
  }

  private createWorksheet<T extends object>(data: T[]): XLSX.WorkSheet {
    return XLSX.utils.json_to_sheet(data as unknown as object[]);
  }

  private monthNames = (monthNum: number): string => {
    const months = [
      'Yanvar',
      'Fevral',
      'Mart',
      'Aprel',
      'May',
      'Iyun',
      'Iyul',
      'Avgust',
      'Sentabr',
      'Oktabr',
      'Noyabr',
      'Dekabr',
    ];
    return months[monthNum - 1] || '';
  };

  private formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  async findHistory(options: {
    school_id: number;
    year?: number;
    month?: number;
    day?: number;
    group_id?: number;
    employee_id?: number;
    status?: 'all' | 'payment' | 'halfPayment' | 'discount';
    page?: number;
  }): Promise<object> {
    try {
      let {
        school_id,
        year,
        month,
        day,
        group_id,
        employee_id,
        status,
        page = 1,
      } = options;

      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      let allowedGroupIds: number[] | undefined = undefined;
      if (employee_id) {
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
        allowedGroupIds = employeeGroups.map((g) => g.id);
        if (allowedGroupIds.length === 0) {
          return {
            status: 200,
            data: {
              records: [],
              total_sum: 0,
              pagination: { currentPage: page, total_pages: 0, total_count: 0 },
            },
          };
        }
      }

      let startDate: Date, endDate: Date;
      if (day && month && year) {
        startDate = new Date(year, month - 1, day);
        endDate = new Date(year, month - 1, day + 1);
      } else if (month && year) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 1);
      } else if (year) {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
      } else {
        throw new BadRequestException('Vaqt parametrlari yetarli emas');
      }

      let whereClause: any = {
        school_id,
        createdAt: { [Op.gte]: startDate, [Op.lt]: endDate },
      };
      if (allowedGroupIds) whereClause.group_id = { [Op.in]: allowedGroupIds };
      if (group_id) whereClause.group_id = group_id;

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
      } else if (status === 'all' || !status) {
        delete whereClause.discount;
        delete whereClause.discountSum;
      }

      const [paymentCount, halfPaymentCount, discountCount] = await Promise.all(
        [
          this.repo.count({
            where: { ...whereClause, discount: 0, discountSum: 0 },
            include: [groupInclude],
          }),
          this.repo.count({
            where: { ...whereClause, discount: 0, discountSum: 0 },
            include: [groupInclude],
          }),
          this.repo.count({
            where: {
              ...whereClause,
              [Op.or]: [
                { discount: { [Op.ne]: 0 } },
                { discountSum: { [Op.ne]: 0 } },
              ],
            },
          }),
        ],
      );

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
        include: [groupInclude, { model: Student, attributes: ['full_name'] }],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      const total_count = count;
      const total_pages = Math.ceil(total_count / limit);

      let total_sum = 0;
      const allProduct = await Promise.all(
        allUsers.map(async (user) => {
          if (!user.group || !user.group.id) return null;
          let teacher_name = 'Nomaʼlum';

          try {
            const group = await this.repoGroup.findOne({
              where: { id: user.group.id, school_id },
              include: [{ model: EmployeeGroup, attributes: ['employee_id'] }],
            });
            const employee_id = group?.employee?.[0]?.employee_id;
            if (employee_id) {
              const employee = await this.repoEmployee.findOne({
                where: { id: employee_id },
                attributes: ['full_name'],
              });
              if (employee?.full_name) teacher_name = employee.full_name;
            }
          } catch {}

          total_sum += Number(user.price || 0);

          return {
            id: user.id,
            student_name: user.student?.full_name || 'O‘chirilgan o‘quvchi',
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

      return {
        status: 200,
        data: {
          records: allProduct.filter(Boolean),
          total_sum,
          pagination: { currentPage: page, total_pages, total_count },
          summary: { paymentCount, halfPaymentCount, discountCount },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findDebtors(
    school_id: number,
    year: string,
    month: string,
    options?: { group_id?: number; employee_id?: number; page?: number },
  ): Promise<object> {
    try {
      const page = options?.page ? Number(options.page) : 1;
      const limit = 15;
      const offset = (page - 1) * limit;

      const { group_id, employee_id } = options || {};

      let students: any[] = [];

      if (group_id) {
        // Group bo'yicha
        const group = await this.repoGroup.findOne({
          where: { id: group_id, school_id },
          attributes: ['id', 'name', 'price', 'start_date'],
          include: [
            {
              model: EmployeeGroup,
              include: [{ model: Employee, attributes: ['id', 'full_name'] }],
            },
            {
              model: StudentGroup,
              include: [
                {
                  model: Student,
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
                    },
                  ],
                },
              ],
            },
          ],
        });

        if (!group) throw new BadRequestException('Guruh topilmadi');

        for (const sg of group.student) {
          students.push({ student: sg.student, group });
        }
      } else if (employee_id) {
        // Employee bo'yicha
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
          include: [
            {
              model: StudentGroup,
              where: { group_id: { [Op.in]: allowedGroupIds } },
              include: [
                {
                  model: Group,
                  include: [{ model: EmployeeGroup, include: [Employee] }],
                },
              ],
            },
            { model: Payment, where: { year, month }, required: false },
          ],
        });

        for (const student of allStudents) {
          for (const sg of student.group) {
            students.push({ student, group: sg.group, studentGroup: sg });
          }
        }
      } else {
        // Barcha talaba
        const allStudents = await this.repoStudent.findAll({
          where: { school_id },
          include: [
            {
              model: StudentGroup,
              include: [
                {
                  model: Group,
                  where: { status: true },
                  include: [{ model: EmployeeGroup, include: [Employee] }],
                },
              ],
            },
            {
              model: Payment,
              where: { year, month, status: { [Op.ne]: 'delete' } },
              required: false,
            },
          ],
        });

        for (const student of allStudents) {
          for (const sg of student.group) {
            students.push({ student, group: sg.group, studentGroup: sg });
          }
        }
      }

      // Qarzdorlarni hisoblash
      const debtors = [];

      for (const entry of students) {
        const student = entry.student;
        const group = entry.group;
        const studentGroup = entry.studentGroup;

        const groupPrice = Number(group.price);
        const teacher = group.employee?.[0]?.employee;
        const teacherName = teacher ? teacher.full_name : 'Noma’lum o‘qituvchi';

        const payments =
          student.payment?.filter((p) => p.group_id === group.id) || [];

        let totalPaid = 0;
        let totalDiscount = 0;
        let paymentDetails = [];

        for (const payment of payments) {
          let discountAmount = 0;
          if (payment.discount && payment.discount > 0)
            discountAmount = (groupPrice * payment.discount) / 100;
          else if (payment.discountSum && payment.discountSum > 0)
            discountAmount = payment.discountSum;

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
            group_start_date: group.start_date,
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
}
