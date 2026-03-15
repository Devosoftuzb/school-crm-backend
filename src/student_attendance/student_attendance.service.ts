import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentAttendance } from './models/student_attendance.model';

@Injectable()
export class StudentAttendanceService {
  constructor(
    @InjectModel(StudentAttendance) private repo: typeof StudentAttendance,
  ) {}

  async create(school_id: number, student_id: number) {
    const last = await this.repo.findOne({
      where: { school_id, student_id },
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
    const limit = 10;
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
}
