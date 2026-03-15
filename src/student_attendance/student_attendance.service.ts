import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentAttendance } from './models/student_attendance.model';

@Injectable()
export class StudentAttendanceService {
  constructor(
    @InjectModel(StudentAttendance) private repo: typeof StudentAttendance,
  ) {}

  async findAll(school_id: number, student_id: number) {
    return await this.repo.findAll({
      where: { school_id, student_id },
    });
  }

  async paginate(
    school_id: number,
    student_id: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id, student_id },
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: { school_id, student_id },
      });
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: user,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
