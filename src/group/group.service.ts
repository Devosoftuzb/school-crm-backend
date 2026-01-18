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

  // async findAll(school_id: number) {
  //   return await this.repo.findAll({
  //     where: { school_id, status: true },
  //   });
  // }

  // async findBySchoolId(school_id: number) {
  //   return await this.repo.findAll({
  //     where: { school_id, status: true },
  //     include: [
  //       {
  //         model: GroupSubject,
  //       },
  //     ],
  //   });
  // }

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
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const groups = await this.repo.findAll({
        where: { school_id, status: true },
        attributes: ['id', 'name', 'price', 'start_date', 'createdAt', 'level'],
        include: [
          {
            model: GroupSubject,
            attributes: ['id'],
            include: [{ model: Subject, attributes: ['id', 'name'] }],
          },
          {
            model: EmployeeGroup,
            where: { employee_id: teacher_id },
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
        'level'
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
        'level'
      ],
      include: [
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

  // async findOneNotInclude(id: number, school_id: number) {
  //   const group = await this.repo.findOne({
  //     where: { id, school_id, status: true },
  //     include: [
  //       {
  //         model: GroupSubject,
  //       },
  //     ],
  //   });

  //   if (!group) {
  //     throw new BadRequestException(
  //       `Group with id ${id} not found in school ${school_id}`,
  //     );
  //   }

  //   return group;
  // }

  // async findOneStudent(id: number, school_id: number) {
  //   const group = await this.repo.findOne({
  //     where: { id, school_id, status: true },
  //     include: [
  //       {
  //         model: StudentGroup,
  //       },
  //     ],
  //   });

  //   if (!group) {
  //     throw new BadRequestException(
  //       `Group with id ${id} not found in school ${school_id}`,
  //     );
  //   }

  //   return group;
  // }

  // async findOnePayment(id: number, school_id: number) {
  //   const group = await this.repo.findOne({
  //     where: { id, school_id, status: true },
  //     include: [
  //       {
  //         model: School,
  //       },
  //       {
  //         model: EmployeeGroup,
  //       },
  //       {
  //         model: StudentGroup,
  //       },
  //     ],
  //   });

  //   if (!group) {
  //     throw new BadRequestException(
  //       `Group with id ${id} not found in school ${school_id}`,
  //     );
  //   }

  //   return group;
  // }

  // async findOneGroup(id: number, school_id: number) {
  //   const group = await this.repo.findOne({
  //     where: { id, school_id, status: true },
  //     attributes: ['id', 'name', 'price'],
  //   });

  //   if (!group) {
  //     throw new BadRequestException(
  //       `Group with id ${id} not found in school ${school_id}`,
  //     );
  //   }

  //   return group;
  // }

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

  // async getEmployeeGroup(employee_id: number, school_id: number) {
  //   const groups = await this.repo.findAll({
  //     where: { school_id, status: true },
  //     include: [
  //       {
  //         model: GroupSubject,
  //       },
  //       {
  //         model: EmployeeGroup,
  //         where: { employee_id },
  //         required: true,
  //       },
  //     ],
  //   });

  //   if (!groups.length) {
  //     throw new BadRequestException(
  //       `No groups found for employee ${employee_id} in school ${school_id}`,
  //     );
  //   }

  //   return groups;
  // }

  async getGroupLevel(school_id: number, overall: string) {
    const levelRank: Record<string, number> = {
      BEGINNER: 1,
      ELEMENTARY: 2,
      'PRE INTERMEDIATE': 3,
      INTERMEDIATE: 4,
      IELTS: 5,
    };


    const userRank =
      overall === "Noma'lum" || !levelRank[overall]
        ? levelRank.BEGINNER
        : levelRank[overall];

    const groups = await this.repo.findAll({
      where: { school_id, status: true },
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
    });

    const matchedGroups = groups
      .filter((g) => {
        const groupRank = levelRank[g.level];

        if (overall === "Noma'lum") {
          return g.level === 'BEGINNER';
        }

        return groupRank <= userRank;
      })
      .map((g) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        teacher: g.employee[0]?.employee?.full_name ?? 'Nomaʼlum',
        student_count: g.student?.length ?? 0,
      }));

    return matchedGroups;
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
      include: [{ model: EmployeeGroup, where: { employee_id: teacher_id }, attributes: ['id'] }],
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
