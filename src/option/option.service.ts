import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Option } from './model/option.model';

@Injectable()
export class OptionService {
  constructor(@InjectModel(Option) private repo: typeof Option) {}

  async create(createOptionDto: CreateOptionDto) {
    const option = await this.repo.create(createOptionDto);
    return {
      message: 'Option created successfully',
      option,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        include: { all: true },
        order: [['createdAt', 'DESC']],
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
    const option = await this.repo.findByPk(id, { include: { all: true } });

    if (!option) {
      throw new BadRequestException(`Option with id ${id} not found`);
    }

    return option;
  }

  async update(id: number, updateOptionDto: UpdateOptionDto) {
    const option = await this.findOne(id);
    await option.update(updateOptionDto);

    return {
      message: 'Option updated successfully',
      option,
    };
  }

  async remove(id: number) {
    const option = await this.findOne(id);
    await option.destroy();

    return {
      message: 'Option removed successfully',
    };
  }
}
