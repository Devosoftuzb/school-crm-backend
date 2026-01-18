import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Subject } from './models/subject.model';
import { Op } from 'sequelize';

@Injectable()
export class SubjectService {
  constructor(@InjectModel(Subject) private repo: typeof Subject) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const subject = await this.repo.create(createSubjectDto);
    return {
      message: 'Subject created successfully',
      subject,
    };
  }

  async findAll(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id },
        attributes: ['id', 'name', 'createdAt'],
        offset,
        limit,
      });
      const total_count = await this.repo.count({ where: { school_id } });
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
    const subject = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      attributes: ['id', 'name'],
    });

    if (!subject) {
      throw new BadRequestException(`Subject with id ${id} not found`);
    }

    return subject;
  }

  async update(
    id: number,
    school_id: number,
    updateSubjectDto: UpdateSubjectDto,
  ) {
    const subject = await this.findOne(id, school_id);
    await subject.update(updateSubjectDto);

    return {
      message: 'Subject updated successfully',
      subject,
    };
  }

  async remove(id: number, school_id: number) {
    const subject = await this.findOne(id, school_id);
    await subject.destroy();

    return {
      message: 'Subject removed successfully',
    };
  }

  async findAdd(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'name'],
    });
  }

  async searchName(school_id: number, name: string) {
    return await this.repo.findAll({
      where: {
        school_id,
        name: { [Op.iLike]: `%${name}%` },
      },
      attributes: ['id', 'name', 'createdAt'],
    });
  }
}
