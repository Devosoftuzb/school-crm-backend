import { Attendance } from './../attendance/models/attendance.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Student } from './models/student.model';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Payment } from 'src/payment/models/payment.model';

@Injectable()
export class StudentService {
  constructor(@InjectModel(Student) private repo: typeof Student) {}

  async create(createStudentDto: CreateStudentDto) {
    const student = await this.repo.create(createStudentDto);
    return {
      message: 'Student created successfully',
      student,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      include: { all: true },
    });
  }

  async findBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      include: [{
        model: StudentGroup
      }],
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id },
        include: [{
          model: StudentGroup
        }],
        order: [['createdAt', 'DESC']],
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

  async findOne(id: number, school_id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: { all: true },
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  async findOneNot(id: number, school_id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      attributes: ['id','full_name', 'phone_number']
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  async findOnePayment(id: number, school_id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: [
        {
          model: Payment,
        },
        {
          model: Attendance,
        },
      ],
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  async findOnePaymentGroup(id: number, school_id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: [
        {
          model: Payment,
        },
        {
          model: StudentGroup,
        },
      ],
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  async findOneGroup(id: number, school_id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: [
        {
          model: StudentGroup,
        },
      ],
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  async update(
    id: number,
    school_id: number,
    updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.findOne(id, school_id);
    await student.update(updateStudentDto);

    return {
      message: 'Student updated successfully',
      student,
    };
  }

  async remove(id: number, school_id: number) {
    const student = await this.findOne(id, school_id);
    await student.destroy();

    return {
      message: 'Student removed successfully',
    };
  }
}
