import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Attendance } from './models/attendance.model';
import { Student } from 'src/student/models/student.model';
import { Op } from 'sequelize';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { SmsService } from 'src/sms/sms.service';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance) private repo: typeof Attendance,
    @InjectModel(Student) private repoStudent: typeof Student,
    private smsService: SmsService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    let attendance = [];
    for (const item of createAttendanceDto.list) {
      const student = await this.repoStudent.findOne({
        where: {
          id: item.student_id,
          school_id: item.school_id,
        },
      });

      if (student) {
        const createdAttendance = await this.repo.create(item);
        attendance.push(createdAttendance);
        if (!item.status) {
          this.smsService.sendAttendance({ student_id: item.student_id });
        }
      }
    }
    return {
      message: 'Attendance created',
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
          attributes: ['status'],
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
        const lastPaymentWithDiscountSum = paymentHistory.find(
          (p) => p.discountSum > 0,
        );
        if (lastPaymentWithDiscountSum) {
          discountedPrice = groupPrice - lastPaymentWithDiscountSum.discountSum;
        } else {
          const lastPayment = paymentHistory[paymentHistory.length - 1];
          const totalDiscount = lastPayment?.discount || 0;
          discountedPrice = Math.round(groupPrice * (1 - totalDiscount / 100));
        }
      }

      const currentMonthPaid = paymentHistory.reduce(
        (sum, p) => sum + p.price,
        0,
      );

      const debt =
        currentMonthPaid >= discountedPrice
          ? "To'langan"
          : `(${(discountedPrice - currentMonthPaid).toLocaleString('uz-UZ')}) so'm to'lanmagan`;

      return {
        id: student.id,
        group_id: student.group[0].group.id,
        student_group_id: student.group[0].id,
        full_name: student.full_name,
        debt,
        attendance: student.attendance[0]?.status || false,
      };
    });

    return [result, { method }];
  }

  async findGroupHistory(
    school_id: number,
    group_id: number,
    year: number,
    month: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const allStudents = await this.repoStudent.findAll({
        where: { school_id },
        include: [
          {
            model: StudentGroup,
            where: { group_id },
            attributes: ['id'],
          },
        ],
        attributes: ['id', 'full_name'],
      });

      const allAttendances = await this.repo.findAll({
        where: {
          school_id,
          group_id,
          createdAt: {
            [Op.gte]: new Date(year, month - 1, 1),
            [Op.lt]: new Date(year, month, 1),
          },
        },
        attributes: ['createdAt', 'status', 'student_id'],
        order: [['createdAt', 'DESC']],
      });

      const attendanceMap = new Map();

      allStudents.forEach((student) => {
        attendanceMap.set(student.id, {
          student_group_id: student.group[0].id,
          student_name: student.full_name,
          attendance: [],
        });
      });

      allAttendances.forEach((record) => {
        const student = attendanceMap.get(record.student_id);
        if (student) {
          student.attendance.push({
            date: record.createdAt.toISOString().split('T')[0],
            status: record.status,
          });
        }
      });

      const attendanceRecords = Array.from(attendanceMap.values());
      const paginatedRecords = attendanceRecords.slice(offset, offset + limit);

      const total_count = attendanceRecords.length;
      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records: paginatedRecords,
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

  async update(school_id: number, updateAttendanceDto: UpdateAttendanceDto) {
    let attendance = [];
    for (const item of updateAttendanceDto.list) {
      const attendanceRecord = await this.repo.findOne({
        where: {
          id: item.attendance_id,
          school_id: school_id,
        },
      });

      if (attendanceRecord) {
        const updatedRecord = await attendanceRecord.update(item);
        attendance.push(updatedRecord);
      }
    }
    return {
      message: 'Attendance updated',
      attendance,
    };
  }

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
