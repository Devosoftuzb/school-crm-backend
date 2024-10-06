import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Attendance } from './models/attendance.model';
import { Student } from 'src/student/models/student.model';
import { Op } from 'sequelize';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance) private repo: typeof Attendance,
    @InjectModel(Student) private repoStudent: typeof Student,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const student = await this.repoStudent.findOne({
      where: {
        id: createAttendanceDto.student_id,
        school_id: createAttendanceDto.school_id,
      },
      include: { all: true },
    });

    if (!student) {
      throw new BadRequestException(
        `Student with id ${createAttendanceDto.student_id} not found`,
      );
    }

    const attendance = await this.repo.create(createAttendanceDto);
    return {
      message: 'Attendance created',
      attendance,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllByAttendanceId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id: school_id },
      include: { all: true },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id },
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count();
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

      const allUsers = await this.repo.findAll({
        where: {
          school_id,
          group_id,
          createdAt: {
            [Op.gte]: new Date(year, month - 1),
            [Op.lt]: new Date(year, month - 1),
          },
        },
        include: { all: true },
        offset,
        limit,
      });

      const total_count = allUsers.length;
      const total_pages = Math.ceil(total_count / limit);

      
      return {
        status: 200,
        data: {
          records: allUsers,
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

  async findOne(id: number, school_id: number) {
    const attendance = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!attendance) {
      throw new BadRequestException(`Attendance with id ${id} not found`);
    }

    return attendance;
  }

  async update(
    id: number,
    school_id: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const attendance = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!attendance) {
      throw new BadRequestException(`Attendance with id ${id} not found`);
    }

    await attendance.update(updateAttendanceDto);

    return {
      message: 'Attendance update',
      attendance,
    };
  }

  async remove(id: number, school_id: number) {
    const attendance = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!attendance) {
      throw new BadRequestException(`Attendance with id ${id} not found`);
    }

    await attendance.destroy();

    return {
      message: 'Attendance remove',
    };
  }
}
