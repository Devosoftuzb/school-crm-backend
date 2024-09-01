import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { InjectModel } from '@nestjs/sequelize';
import { School } from './models/school.model';

@Injectable()
export class SchoolService {
  constructor(@InjectModel(School) private repo: typeof School) {}

  async create(createSchoolDto: CreateSchoolDto) {
    const school = await this.repo.create(createSchoolDto);
    return {
      message: 'School created',
      school,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
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

  async findOne(id: number) {
    const school = await this.repo.findByPk(id, { include: { all: true } });

    if (!school) {
      throw new BadRequestException(`School with id ${id} not found`);
    }

    return school;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto) {
    const school = await this.repo.findByPk(id, { include: { all: true } });

    if (!school) {
      throw new BadRequestException(`School with id ${id} not found`);
    }

    await school.update(updateSchoolDto);

    return {
      message: 'School update',
      school,
    };
  }

  async remove(id: number) {
    const school = await this.repo.findByPk(id, { include: { all: true } });

    if (!school) {
      throw new BadRequestException(`School with id ${id} not found`);
    }

    await school.destroy();

    return {
      message: 'School remove',
    };
  }
}
