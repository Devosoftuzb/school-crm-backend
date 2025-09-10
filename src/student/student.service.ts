import { Attendance } from './../attendance/models/attendance.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Student } from './models/student.model';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Payment } from 'src/payment/models/payment.model';
import { ArchiveStudentDto } from './dto/archive-student.dto';
import { Group } from 'src/group/models/group.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student) private repo: typeof Student,
    @InjectModel(EmployeeGroup) private repoEmployeeGroup: typeof EmployeeGroup,
  ) {}

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
      where: { school_id, status: true },
      include: [
        {
          model: StudentGroup,
          include: [
            {
              model: Group,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });
  }

  async findBySchoolIdNot(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'full_name'],
    });
  }

  async findByTeacherId(school_id: number, teacher_id: number) {
    try {
      const teacherGroups = await this.repoEmployeeGroup.findAll({
        where: { employee_id: teacher_id },
        attributes: ['group_id'],
      });

      const groupIds = teacherGroups.map((g) => g.group_id);

      if (groupIds.length === 0) {
        return [];
      }

      const students = await this.repo.findAll({
        where: { school_id, status: true },
        include: [
          {
            model: StudentGroup,
            where: {
              group_id: groupIds,
            },
            include: [
              {
                model: Group,
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      });

      return students;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findByArchiveSchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id, status: false },
      include: [
        {
          model: StudentGroup,
        },
      ],
    });
  }

  async paginateArchive(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id, status: false },
        include: [
          {
            model: StudentGroup,
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: { school_id, status: false },
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

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id, status: true },
        include: [
          {
            model: StudentGroup,
            include: [{ model: Group, attributes: ['id', 'name'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: { school_id, status: true },
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

  async paginateTeacher(
    school_id: number,
    teacher_id: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const teacherGroups = await this.repoEmployeeGroup.findAll({
        where: { employee_id: teacher_id },
        attributes: ['group_id'],
      });

      const groupIds = teacherGroups.map((g) => g.group_id);

      if (groupIds.length === 0) {
        return {
          status: 200,
          data: {
            records: [],
            pagination: {
              currentPage: page,
              total_pages: 0,
              total_count: 0,
            },
          },
        };
      }

      const students = await this.repo.findAll({
        where: { school_id, status: true },
        include: [
          {
            model: StudentGroup,
            where: {
              group_id: groupIds,
            },
            include: [{ model: Group, attributes: ['id', 'name'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      const total_count = await this.repo.count({
        where: { school_id, status: true },
        include: [
          {
            model: StudentGroup,
            where: {
              group_id: groupIds,
            },
          },
        ],
      });

      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records: students,
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
      attributes: ['id', 'full_name', 'phone_number'],
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  // async findAllNot(school_id: number) {
  //   console.log(school_id)
  //   const student = await this.repo.findAll({
  //     where: { school_id },
  //     attributes: ['id', 'full_name'],
  //   });

  //   console.log(student)
  //   if (!student) {
  //     throw new BadRequestException(
  //       `Student with school id ${school_id} not found`,
  //     );
  //   }

  //   return student;
  // }

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
          include: [
            {
              model: Group,
              attributes: ['id', 'name'],
            },
          ],
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

  async archive(
    id: number,
    school_id: number,
    archiveStudentDto: ArchiveStudentDto,
  ) {
    const student = await this.findOne(id, school_id);
    await student.update(archiveStudentDto);

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
