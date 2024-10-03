import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGroupDayDto } from './dto/create-group_day.dto';
import { InjectModel } from '@nestjs/sequelize';
import { GroupDay } from './models/group_day.model';

@Injectable()
export class GroupDayService {
  constructor(@InjectModel(GroupDay) private repo: typeof GroupDay) {}

  async create(createGroupDayDto: CreateGroupDayDto) {
    const groupDay = await this.repo.create(createGroupDayDto);
    return {
      message: 'Group Day created successfully',
      groupDay,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findOne(id: number) {
    const groupDay = await this.repo.findByPk(id, { include: { all: true } });

    if (!groupDay) {
      throw new BadRequestException(`Group Day with id ${id} not found`);
    }

    return groupDay;
  }

  async remove(id: number) {
    const groupDay = await this.findOne(id);
    await groupDay.destroy();

    return {
      message: 'Group Day removed successfully',
    };
  }
}
