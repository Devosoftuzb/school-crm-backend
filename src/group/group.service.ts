import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(@InjectModel(Group) private repo: typeof Group) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = await this.repo.create(createGroupDto);
    return {
      message: 'Group created',
      group,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllByGroupId(school_id: number) {
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

  async findOne(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!group) {
      throw new BadRequestException(`Group with id ${id} not found`);
    }

    return group;
  }

  async update(id: number, school_id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!group) {
      throw new BadRequestException(`Group with id ${id} not found`);
    }

    await group.update(updateGroupDto);

    return {
      message: 'Group update',
      group,
    };
  }

  async remove(id: number, school_id: number) {
    const group = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!group) {
      throw new BadRequestException(`Group with id ${id} not found`);
    }

    await group.destroy();

    return {
      message: 'Group remove',
    };
  }
}
