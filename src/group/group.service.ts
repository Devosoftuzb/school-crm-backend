import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupSubject } from 'src/group_subject/models/group_subject.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { School } from 'src/school/models/school.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { GroupDay } from 'src/group_day/models/group_day.model';
import { Subject } from 'src/subject/models/subject.model';
import { Op } from 'sequelize';
import { Employee } from 'src/employee/models/employee.model';
import { Student } from 'src/student/models/student.model';
import { Room } from 'src/room/models/room.model';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group) private repo: typeof Group,
    @InjectModel(StudentGroup) private studentGroupRepo: typeof StudentGroup,
    @InjectModel(EmployeeGroup) private employeeGroupRepo: typeof EmployeeGroup,
    @InjectModel(GroupSubject) private subjectGroupRepo: typeof GroupSubject,
    @InjectModel(GroupDay) private dayGroupRepo: typeof GroupDay,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = await this.repo.create(createGroupDto);
    await this.subjectGroupRepo.create({
      group_id: group.id,
      subject_id: createGroupDto.subject_id,
    });
    await this.employeeGroupRepo.create({
      group_id: group.id,
      employee_id: createGroupDto.teacher_id,
    });
    return {
      message: 'Group created successfully',
      group,
    };
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const groups = await this.repo.findAll({
        where: { school_id, status: true },
        attributes: ['id', 'name', 'price', 'start_date', 'createdAt', 'level'],
        include: [
          {
            model: Room,
            attributes: ['id', 'name'],
          },
          {
            model: GroupSubject,
            attributes: ['id'],
            include: [{ model: Subject, attributes: ['id', 'name'] }],
          },
          {
            model: EmployeeGroup,
            attributes: ['id'],
            include: [{ model: Employee, attributes: ['id', 'full_name'] }],
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
      return {
        status: 200,
        data: {
          records: groups,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to paginate groups: ' + error.message,
      );
    }
  }

  async paginateTeacher(
    school_id: number,
    teacher_id: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page) || 1;
      const limit = 15;
      const offset = (page - 1) * limit;

      const { rows, count } = await this.repo.findAndCountAll({
        where: {
          school_id,
          status: true,
        },
        attributes: ['id', 'name', 'price', 'start_date', 'createdAt', 'level'],
        include: [
          {
            model: Room,
            attributes: ['id', 'name'],
          },
          {
            model: GroupSubject,
            attributes: ['id'],
            include: [
              {
                model: Subject,
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: EmployeeGroup,
            where: { employee_id: teacher_id },
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Employee,
                attributes: ['id', 'full_name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const total_pages = Math.ceil(count / limit);

      return {
        status: 200,
        data: {
          records: rows,
          pagination: {
            currentPage: page,
            total_pages,
            total_count: count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to paginate groups: ' + error.message,
      );
    }
  }

  async findOne(school_id: number, id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id, status: true },
      attributes: [
        'id',
        'name',
        'price',
        'start_date',
        'start_time',
        'end_time',
        'room_id',
        'level',
      ],
    });

    if (!group) {
      throw new BadRequestException(
        `Group with id ${id} not found in school ${school_id}`,
      );
    }

    return group;
  }

  async findOneAll(school_id: number, id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id, status: true },
      attributes: [
        'id',
        'name',
        'price',
        'start_date',
        'start_time',
        'end_time',
        'level',
      ],
      include: [
        {
          model: Room,
          attributes: ['id', 'name'],
        },
        {
          model: EmployeeGroup,
          attributes: ['id', 'createdAt'],
          include: [
            {
              model: Employee,
              attributes: ['id', 'full_name', 'role', 'phone_number'],
            },
          ],
        },
        {
          model: StudentGroup,
          attributes: ['id', 'createdAt'],
          include: [
            { model: Student, attributes: ['id', 'full_name', 'phone_number'] },
          ],
        },
      ],
    });

    if (!group) {
      throw new BadRequestException(
        `Group with id ${id} not found in school ${school_id}`,
      );
    }

    return group;
  }

  async update(school_id: number, id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(school_id, id);
    await group.update(updateGroupDto);

    return {
      message: 'Group updated successfully',
      group,
    };
  }

  async remove(id: number, school_id: number) {
    const group = await this.findOne(school_id, id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    await group.update({ status: false });

    await this.studentGroupRepo.destroy({
      where: { group_id: id },
    });

    await this.employeeGroupRepo.destroy({
      where: { group_id: id },
    });

    await this.subjectGroupRepo.destroy({
      where: { group_id: id },
    });

    await this.dayGroupRepo.destroy({
      where: { group_id: id },
    });

    return {
      message: 'Group removed successfully',
    };
  }

  async getGroupLevel(
    school_id: number,
    overall: string,
    page: number = 1,
    limit: number = 15,
    search: string = '',
  ) {
    const levelRank: Record<string, number> = {
      BEGINNER: 1,
      ELEMENTARY: 2,
      'PRE INTERMEDIATE': 3,
      INTERMEDIATE: 4,
      IELTS: 5,
    };

    const targetLevel =
      overall === "Noma'lum" || (!levelRank[overall] && overall !== 'all')
        ? 'BEGINNER'
        : overall;

    const offset = (page - 1) * limit;

    const whereCondition: any = { school_id, status: true };

    if (overall !== 'all') {
      whereCondition.level = targetLevel;
    }

    if (search) {
      whereCondition.name = { [Op.iLike]: `%${search}%` };
    }

    const groups = await this.repo.findAll({
      where: whereCondition,
      include: [
        {
          model: EmployeeGroup,
          include: [{ model: Employee, attributes: ['full_name'] }],
        },
        {
          model: StudentGroup,
          attributes: ['id'],
        },
      ],
      offset,
      limit,
      order: [['id', 'ASC']],
    });

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      level: g.level,
      teacher: g.employee[0]?.employee?.full_name ?? 'Nomaʼlum',
      student_count: g.student?.length ?? 0,
    }));
  }

  async findAdd(school_id: number) {
    return await this.repo.findAll({
      where: { school_id, status: true },
      attributes: ['id', 'name'],
    });
  }

  async findTeacherGroup(school_id: number, teacher_id: number) {
    return await this.repo.findAll({
      where: { school_id, status: true },
      attributes: ['id', 'name'],
      include: [
        {
          model: EmployeeGroup,
          where: { employee_id: teacher_id },
          attributes: ['id'],
        },
      ],
    });
  }

  async searchName(school_id: number, name: string) {
    return await this.repo.findAll({
      where: {
        school_id,
        status: true,
        name: { [Op.iLike]: `%${name}%` },
      },
      attributes: ['id', 'name', 'price', 'start_date', 'createdAt', 'level'],
      include: [
        {
          model: Room,
          attributes: ['id', 'name'],
        },
        {
          model: GroupSubject,
          attributes: ['id'],
          include: [{ model: Subject, attributes: ['id', 'name'] }],
        },
        {
          model: EmployeeGroup,
          attributes: ['id'],
          include: [{ model: Employee, attributes: ['id', 'full_name'] }],
        },
      ],
    });
  }
}
