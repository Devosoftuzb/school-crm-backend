import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Cost } from './model/cost.model';
import { Op } from 'sequelize';

@Injectable()
export class CostService {
  constructor(@InjectModel(Cost) private repo: typeof Cost) {}

  async create(createCostDto: CreateCostDto) {
    const cost = await this.repo.create(createCostDto);
    return {
      message: 'Cost created successfully',
      cost,
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

  async paginate(
    school_id: number,
    year: number,
    month: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const condition = {
        school_id,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      };

      const cost = await this.repo.findAll({
        where: condition,
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: condition,
      });
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: cost,
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

  async paginateYear(
    school_id: number,
    year: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      const condition = {
        school_id,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      };

      const cost = await this.repo.findAll({
        where: condition,
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: condition,
      });
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: cost,
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

  async paginateCategory(
    school_id: number,
    year: number,
    month: number,
    category_id: number,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const condition = {
        school_id,
        category_id,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      };

      const cost = await this.repo.findAll({
        where: condition,
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: condition,
      });
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: cost,
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
    const cost = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: { all: true },
    });

    if (!cost) {
      throw new BadRequestException(`Cost with id ${id} not found`);
    }

    return cost;
  }

  async update(id: number, school_id: number, updateCostDto: UpdateCostDto) {
    const cost = await this.findOne(id, school_id);
    await cost.update(updateCostDto);

    return {
      message: 'Cost updated successfully',
      cost,
    };
  }

  async remove(id: number, school_id: number) {
    const cost = await this.findOne(id, school_id);
    await cost.destroy();

    return {
      message: 'Cost removed successfully',
    };
  }
}
