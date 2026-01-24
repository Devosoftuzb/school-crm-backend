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
import { Op } from 'sequelize';
import { GroupSubject } from 'src/group_subject/models/group_subject.model';
import { Subject } from 'src/subject/models/subject.model';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student) private repo: typeof Student,
    @InjectModel(EmployeeGroup) private repoEmployeeGroup: typeof EmployeeGroup,
    @InjectModel(StudentGroup) private repoStudentGroup: typeof StudentGroup,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const student = await this.repo.create(createStudentDto);
    await this.repoStudentGroup.create({
      student_id: student.id,
      group_id: createStudentDto.group_id,
    });
    return {
      message: 'Student created successfully',
      student,
    };
  }

  async findBySchoolIdNot(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'full_name'],
    });
  }

  async paginateArchive(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id, status: false },
        attributes: ['id', 'full_name', 'phone_number', 'status', 'createdAt'],
        include: [
          {
            model: StudentGroup,
            attributes: ['id'],
            include: [{ model: Group, attributes: ['id', 'name'] }],
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
        attributes: ['id', 'full_name', 'phone_number', 'status', 'createdAt'],
        include: [
          {
            model: StudentGroup,
            attributes: ['id'],
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
      });

      if (!teacherGroups.length) {
        return {
          status: 200,
          data: {
            records: [],
            pagination: { currentPage: page, total_pages: 0, total_count: 0 },
          },
        };
      }

      const groupIds = teacherGroups.map((g) => g.group_id);

      const { rows: students, count: total_count } =
        await this.repo.findAndCountAll({
          where: { school_id, status: true },
          include: [
            {
              model: StudentGroup,
              where: { group_id: { [Op.in]: groupIds } },
              attributes: ['id', 'group_id'],
              include: [
                {
                  model: Group,
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
          order: [['createdAt', 'DESC']],
          offset,
          limit,
          distinct: true, // count to'g'ri chiqishi uchun
        });

      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records: students,
          pagination: { currentPage: page, total_pages, total_count },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(school_id: number, id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      attributes: [
        'id',
        'full_name',
        'phone_number',
        'parents_full_name',
        'parents_phone_number',
        'status',
        'createdAt',
      ],
      include: [
        {
          model: StudentGroup,
          attributes: ['id', 'createdAt'],
          include: [
            {
              model: Group,
              attributes: ['id', 'name', 'price', 'start_date'],
              include: [
                {
                  model: GroupSubject,
                  attributes: ['id'],
                  include: [{ model: Subject, attributes: ['id', 'name'] }],
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          where: { status: { [Op.ne]: 'delete' } },
          attributes: ['id', 'method', 'price', 'month', 'createdAt'],
          include: [{ model: Group, attributes: ['id', 'name', 'price'] }],
        },
      ],
    });

    if (!student) {
      throw new BadRequestException(`Student with id ${id} not found`);
    }

    return student;
  }

  async findOneNot(school_id: number, id: number) {
    const student = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      attributes: [
        'id',
        'full_name',
        'phone_number',
        'parents_full_name',
        'parents_phone_number',
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

  async searchName(school_id: number, name: string) {
    return await this.repo.findAll({
      where: {
        school_id,
        status: true,
        full_name: { [Op.iLike]: `%${name}%` },
      },
      include: [
        {
          model: StudentGroup,
          include: [{ model: Group, attributes: ['id', 'name'] }],
        },
      ],
      attributes: ['id', 'full_name', 'phone_number'],
    });
  }

  async searchNameTeacher(school_id: number, teacher_id: number, name: string) {
    return await this.repo.findAll({
      where: {
        school_id,
        status: true,
        full_name: { [Op.iLike]: `%${name}%` },
      },
      include: [
        {
          model: StudentGroup,
          include: [
            {
              model: Group,
              attributes: ['id', 'name'],
              include: [
                { model: EmployeeGroup, where: { employee_id: teacher_id } },
              ],
            },
          ],
        },
      ],
      attributes: ['id', 'full_name', 'phone_number'],
    });
  }

  async searchNameArchive(school_id: number, name: string) {
    return await this.repo.findAll({
      where: {
        school_id,
        status: false,
        full_name: { [Op.iLike]: `%${name}%` },
      },
      include: [
        {
          model: StudentGroup,
          include: [{ model: Group, attributes: ['id', 'name'] }],
        },
      ],
      attributes: ['id', 'full_name', 'phone_number'],
    });
  }
}
