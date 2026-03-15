import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Attendance } from './models/attendance.model';
import { Student } from 'src/student/models/student.model';
import { Op } from 'sequelize';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';
import * as XLSX from 'xlsx';
import { Response } from 'express';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance) private repo: typeof Attendance,
    @InjectModel(Student) private repoStudent: typeof Student,
    @InjectModel(Group) private repoGroup: typeof Group,
  ) {}

  async saveAttendance(dto: CreateAttendanceDto) {
    const attendance = [];

    for (const item of dto.list) {
      const student = await this.repoStudent.findOne({
        where: {
          id: item.student_id,
          school_id: item.school_id,
        },
        include: [
          {
            model: StudentGroup,
            where: { group_id: item.group_id },
            required: true,
          },
        ],
      });

      if (!student) continue;

      let record;
      let isCreated = false;

      if (item.attendance_id) {
        const existingAttendance = await this.repo.findOne({
          where: {
            id: item.attendance_id,
            school_id: item.school_id,
          },
        });

        if (existingAttendance) {
          record = await existingAttendance.update(item);
        }
      }

      if (!record) {
        record = await this.repo.create(item);
        isCreated = true;
      }

      attendance.push(record);
    }

    return {
      message: 'Attendance saved',
      attendance,
    };
  }

  async findGroupStudent(school_id: number, group_id: number) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

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
          include: [{ model: Group, attributes: ['id', 'price'] }],
        },
        {
          model: Attendance,
          where: {
            group_id,
            createdAt: { [Op.gte]: startOfDay, [Op.lt]: endOfDay },
          },
          required: false,
          attributes: ['id', 'status'],
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

    const hasAttendance = students.some(
      (student) => student.attendance && student.attendance.length > 0,
    );
    const method = hasAttendance ? 'put' : 'post';

    const result = students.map((student) => {
      const groupPrice = Number(student.group[0].group.price);

      const paymentHistory = student.payment || [];
      let discountedPrice = groupPrice;
      if (paymentHistory.length > 0) {
        const totalDiscount = paymentHistory.reduce(
          (sum, p) => sum + (Number(p.discount) || 0),
          0,
        );
        discountedPrice = Math.round(groupPrice * (1 - totalDiscount / 100));

        const totalDiscountSum = paymentHistory.reduce(
          (sum, p) => sum + (Number(p.discountSum) || 0),
          0,
        );
        discountedPrice = discountedPrice - totalDiscountSum;
      }

      const currentMonthPaid = paymentHistory.reduce(
        (sum, p) => sum + Number(p.price),
        0,
      );

      const debt =
        currentMonthPaid >= discountedPrice
          ? "To'langan"
          : `(${(discountedPrice - currentMonthPaid).toLocaleString('uz-UZ')}) so'm to'lanmagan`;

      return {
        id: student.id,
        attendance_id: student.attendance[0]?.id,
        group_id: student.group[0].group.id,
        student_group_id: student.group[0].id,
        full_name: student.full_name,
        debt,
        attendance: student.attendance[0]?.status ?? true,
      };
    });

    return [result, { method }];
  }

  async findGroupHistory(
    school_id: number,
    group_id: number,
    year: number,
    month: number | null,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const dateFilter = month
        ? {
            [Op.gte]: new Date(year, month - 1, 1),
            [Op.lt]: new Date(year, month, 1),
          }
        : {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          };

      const currentStudents = await this.repoStudent.findAll({
        where: { school_id },
        include: [
          {
            model: StudentGroup,
            where: { group_id },
            required: true,
            attributes: ['id'],
          },
        ],
        attributes: ['id', 'full_name'],
      });

      const currentStudentIds = new Set(currentStudents.map((s) => s.id));

      const allAttendances = await this.repo.findAll({
        where: { school_id, group_id, createdAt: dateFilter },
        attributes: ['createdAt', 'status', 'student_id'],
        order: [['createdAt', 'ASC']],
      });

      const leftStudentIds = [
        ...new Set(
          allAttendances
            .map((a) => a.student_id)
            .filter((id) => !currentStudentIds.has(id)),
        ),
      ];

      let leftStudents: Student[] = [];
      if (leftStudentIds.length) {
        leftStudents = await this.repoStudent.findAll({
          where: { id: { [Op.in]: leftStudentIds } },
          attributes: ['id', 'full_name'],
        });
      }

      const buildAttendanceMap = (students: Student[], isLeft = false) => {
        return students.map((student) => {
          const attendance = allAttendances
            .filter((a) => a.student_id === student.id)
            .map((a) => ({
              date: new Date(a.createdAt).toISOString().split('T')[0],
              status: a.status,
            }));

          return {
            student_id: student.id,
            student_group_id: !isLeft ? student.group[0].id : null,
            student_name: student.full_name,
            is_left: isLeft,
            attendance,
          };
        });
      };

      const currentRecords = buildAttendanceMap(currentStudents, false);
      const leftRecords = buildAttendanceMap(leftStudents, true);

      const paginatedCurrent = currentRecords.slice(offset, offset + limit);

      const records = [...paginatedCurrent];
      if (offset + limit >= currentRecords.length && leftRecords.length) {
        records.push(...leftRecords);
      }

      const total_count = currentRecords.length;
      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records,
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

  async excelAttendanceHistory(
    school_id: number,
    group_id: number,
    year: number,
    month?: number,
    res?: Response,
  ) {
    try {
      const dateFilter = month
        ? {
            [Op.gte]: new Date(year, month - 1, 1),
            [Op.lt]: new Date(year, month, 1),
          }
        : {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          };

      const group = await this.repoGroup.findOne({
        where: { id: group_id },
        attributes: ['name'],
      });
      const groupName = group?.name || `guruh_${group_id}`;

      const allAttendances = await this.repo.findAll({
        where: { school_id, group_id, createdAt: dateFilter },
        attributes: ['student_id', 'status', 'createdAt'],
        order: [['createdAt', 'ASC']],
      });

      if (!allAttendances.length) {
        throw new BadRequestException("Ma'lumot topilmadi");
      }

      const uniqueDates = [
        ...new Set(
          allAttendances.map(
            (a) => new Date(a.createdAt).toISOString().split('T')[0],
          ),
        ),
      ].sort();

      const currentStudents = await this.repoStudent.findAll({
        where: { school_id, status: true },
        attributes: ['id', 'full_name'],
        include: [
          {
            model: StudentGroup,
            where: { group_id },
            required: true,
            attributes: [],
          },
        ],
      });

      const currentStudentIds = new Set(currentStudents.map((s) => s.id));

      const allStudentIds = [
        ...new Set(allAttendances.map((a) => a.student_id)),
      ];

      const leftStudentIds = allStudentIds.filter(
        (id) => !currentStudentIds.has(id),
      );

      let leftStudents: Student[] = [];
      if (leftStudentIds.length) {
        leftStudents = await this.repoStudent.findAll({
          where: { id: { [Op.in]: leftStudentIds } },
          attributes: ['id', 'full_name'],
        });
      }

      const attendanceMap = new Map<number, Map<string, boolean>>();
      for (const a of allAttendances) {
        const date = new Date(a.createdAt).toISOString().split('T')[0];
        if (!attendanceMap.has(a.student_id)) {
          attendanceMap.set(a.student_id, new Map());
        }
        attendanceMap.get(a.student_id)!.set(date, a.status);
      }

      const buildRow = (student: Student, isLeft = false) => {
        const record: Record<string, any> = {
          "O'quvchi": isLeft
            ? `${student.full_name} (chiqib ketgan)`
            : student.full_name,
        };
        const studentDates = attendanceMap.get(student.id) || new Map();
        for (const date of uniqueDates) {
          const [, m, d] = date.split('-');
          const label = `${d}.${m}`;
          const status = studentDates.get(date);
          record[label] = status === undefined ? '-' : status ? '✓' : '✗';
        }
        const vals = [...studentDates.values()];
        record['Kelgan'] = vals.filter(Boolean).length;
        record['Kelmagan'] = vals.filter((v) => !v).length;
        return record;
      };

      const dataToExport: Record<string, any>[] = [];

      for (const s of currentStudents) {
        dataToExport.push(buildRow(s, false));
      }

      if (leftStudents.length) {
        const separator: Record<string, any> = {
          "O'quvchi": '— Guruhdan chiqib ketganlar —',
        };
        for (const date of uniqueDates) {
          const [, m, d] = date.split('-');
          separator[`${d}.${m}`] = '';
        }
        separator['Kelgan'] = '';
        separator['Kelmagan'] = '';
        dataToExport.push(separator);

        for (const s of leftStudents) {
          dataToExport.push(buildRow(s, true));
        }
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = this.createWorksheet(dataToExport);

      worksheet['!cols'] = [
        { wch: 28 },
        ...uniqueDates.map(() => ({ wch: 6 })),
        { wch: 10 },
        { wch: 10 },
      ];

      const sheetName = month
        ? `${groupName} ${this.monthNames(month)} ${year}`
        : `${groupName} ${year}`;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31)); // Excel 31 ta belgi limit

      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      }) as Buffer;

      const safeName = groupName.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = month
        ? `davomat_${safeName}_${month}_${year}.xlsx`
        : `davomat_${safeName}_${year}.xlsx`;

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
        error.message || 'Excel yaratishda xatolik yuz berdi',
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

  async remove(group_id: number, student_id: number, school_id: number) {
    const attendances = await this.repo.findAll({
      where: {
        group_id: group_id,
        student_id: student_id,
        school_id: school_id,
      },
    });

    await this.repo.destroy({
      where: {
        group_id: group_id,
        student_id: student_id,
        school_id: school_id,
      },
    });

    return {
      message: `${attendances.length} attendance records removed`,
    };
  }
}
