import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentAttendance } from './models/student_attendance.model';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import { Student } from 'src/student/models/student.model';

@Injectable()
export class StudentAttendanceService {
  constructor(
    @InjectModel(StudentAttendance) private repo: typeof StudentAttendance,
  ) {}

  async create(school_id: number, student_id: number) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const last = await this.repo.findOne({
      where: {
        school_id,
        student_id,
        time: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['time', 'DESC']],
    });

    const type: 'IN' | 'OUT' = last?.type === 'IN' ? 'OUT' : 'IN';

    const attendance = await this.repo.create({
      school_id,
      student_id,
      type,
      time: new Date(),
    });

    return attendance;
  }

  async findAll(school_id: number, student_id: number) {
    const attendances = await this.repo.findAll({
      where: { school_id, student_id },
      attributes: ['id', 'type', 'time'],
      order: [['time', 'DESC']],
    });

    const grouped = new Map<string, { type: string; time: Date }[]>();

    for (const a of attendances) {
      const date = new Date(a.time).toISOString().split('T')[0];
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push({ type: a.type, time: a.time });
    }

    const result = Array.from(grouped.entries()).map(([date, records]) => ({
      date,
      records,
    }));

    return result;
  }

  async paginate(school_id: number, student_id: number, page: number) {
    page = Number(page);
    const limit = 15;
    const offset = (page - 1) * limit;

    const attendances = await this.repo.findAll({
      where: { school_id, student_id },
      attributes: ['id', 'type', 'time'],
      order: [['time', 'DESC']],
    });

    const grouped = new Map<string, { type: string; time: string }[]>();

    for (const a of attendances) {
      const date = new Date(a.time).toISOString().split('T')[0];
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push({
        type: a.type,
        time: new Date(a.time).toTimeString().slice(0, 5),
      });
    }

    const allDates = Array.from(grouped.entries()).map(([date, records]) => ({
      date,
      records,
    }));

    const total_count = allDates.length;
    const total_pages = Math.ceil(total_count / limit);
    const paginatedData = allDates.slice(offset, offset + limit);

    return {
      status: 200,
      data: {
        records: paginatedData,
        pagination: {
          currentPage: page,
          total_pages,
          total_count,
        },
      },
    };
  }

  async excelAttendance(
    school_id: number,
    startDate: string,
    endDate: string,
    res: Response,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const attendances = await this.repo.findAll({
        where: {
          school_id,
          time: { [Op.between]: [start, end] },
        },
        attributes: ['student_id', 'type', 'time'],
        include: [{ model: Student, attributes: ['full_name'] }],
        order: [['time', 'ASC']],
      });

      if (!attendances.length) {
        throw new BadRequestException("Ma'lumot topilmadi");
      }

      const allDays: string[] = [];
      const cursor = new Date(start);
      while (cursor <= end) {
        allDays.push(cursor.toISOString().split('T')[0]);
        cursor.setDate(cursor.getDate() + 1);
      }

      type StudentDayMap = {
        name: string;
        days: Map<string, { ins: string[]; outs: string[] }>;
      };

      const studentMap = new Map<number, StudentDayMap>();

      for (const a of attendances) {
        const date = new Date(a.time).toISOString().split('T')[0];
        const timeStr = new Date(a.time).toTimeString().slice(0, 5);

        if (!studentMap.has(a.student_id)) {
          studentMap.set(a.student_id, {
            name: a.student?.full_name || `student_${a.student_id}`,
            days: new Map(),
          });
        }

        const studentData = studentMap.get(a.student_id)!;
        if (!studentData.days.has(date)) {
          studentData.days.set(date, { ins: [], outs: [] });
        }

        if (a.type === 'IN') {
          studentData.days.get(date)!.ins.push(timeStr);
        } else {
          studentData.days.get(date)!.outs.push(timeStr);
        }
      }

      const dataToExport: Record<string, any>[] = [];

      for (const [, studentData] of studentMap) {
        const row: Record<string, any> = { "O'quvchi": studentData.name };

        for (const date of allDays) {
          const [, mm, dd] = date.split('-');
          const label = `${dd}.${mm}`;
          const record = studentData.days.get(date);

          if (!record) {
            row[label] = '✗';
          } else {
            const inTime = record.ins[0] || '';
            const outTime = record.outs[record.outs.length - 1] || '';

            if (inTime && outTime) {
              row[label] = `✓ ${inTime}-${outTime}`;
            } else if (inTime) {
              row[label] = `✓ ${inTime}`;
            } else {
              // ← mana shu holat
              console.log(
                `⚠️ Vaqtsiz record | O'quvchi: ${studentData.name} | Sana: ${date}`,
                {
                  ins: record.ins,
                  outs: record.outs,
                  fullRecord: record,
                },
              );
              row[label] = '✓';
            }
          }
        }

        dataToExport.push(row);
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      worksheet['!cols'] = [{ wch: 26 }, ...allDays.map(() => ({ wch: 20 }))];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Davomat');

      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      }) as Buffer;

      const fileName = `attendance_${school_id}_${startDate}_${endDate}.xlsx`;

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
}
