import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupSubject } from 'src/group_subject/models/group_subject.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { School } from 'src/school/models/school.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';

@Injectable()
export class GroupService {
  constructor(@InjectModel(Group) private repo: typeof Group) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = await this.repo.create(createGroupDto);
    return {
      message: 'Group created successfully',
      group,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
    });
  }

  async findBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      include: [
        {
          model: GroupSubject,
        },
      ],
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const groups = await this.repo.findAll({
        where: { school_id: school_id },
        include: [
          {
            model: GroupSubject,
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });
      const total_count = await this.repo.count({ where: { school_id } });
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

  async findOne(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id },
      include: [{
        model: GroupSubject,
      },
      {
        model: EmployeeGroup,
      }
    ]
    });

    if (!group) {
      throw new BadRequestException(
        `Group with id ${id} not found in school ${school_id}`,
      );
    }

    return group;
  }

  async findOneNotInclude(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id },
      include: [
        {
          model: GroupSubject,
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

  async findOneStudent(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id },
      include: [
        {
          model: StudentGroup,
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

  async findOnePayment(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id },
      include: [
        {
          model: School,
        },
        {
          model: EmployeeGroup,
        },
        {
          model: StudentGroup,
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

  async findOneGroup(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: { id, school_id },
      attributes: ['id', 'name', 'price']
    });

    if (!group) {
      throw new BadRequestException(
        `Group with id ${id} not found in school ${school_id}`,
      );
    }

    return group;
  }

  async update(id: number, school_id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id, school_id);
    await group.update(updateGroupDto);

    return {
      message: 'Group updated successfully',
      group,
    };
  }

  async remove(id: number, school_id: number) {
    const group = await this.findOne(id, school_id);
    await group.destroy();

    return {
      message: 'Group removed successfully',
    };
  }
}
