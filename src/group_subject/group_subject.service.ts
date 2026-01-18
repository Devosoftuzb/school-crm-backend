import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGroupSubjectDto } from './dto/create-group_subject.dto';
import { InjectModel } from '@nestjs/sequelize';
import { GroupSubject } from './models/group_subject.model';

@Injectable()
export class GroupSubjectService {
  constructor(@InjectModel(GroupSubject) private repo: typeof GroupSubject) {}

  async create(createGroupSubjectDto: CreateGroupSubjectDto) {
    const oldGroupSubject = await this.repo.findOne({
      where: {
        subject_id: createGroupSubjectDto.subject_id,
        group_id: createGroupSubjectDto.group_id,
      },
    });

    if (oldGroupSubject) {
      throw new BadRequestException(`This subject already exists`);
    }
    const groupSubject = await this.repo.create(createGroupSubjectDto);
    return {
      message: 'Group Subject created successfully',
      groupSubject,
    };
  }

  async findOne(id: number) {
    const groupSubject = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!groupSubject) {
      throw new BadRequestException(`Group Subject with id ${id} not found`);
    }

    return groupSubject;
  }

  async remove(id: number) {
    const groupSubject = await this.findOne(id);
    await groupSubject.destroy();

    return {
      message: 'Group Subject removed successfully',
    };
  }
}
