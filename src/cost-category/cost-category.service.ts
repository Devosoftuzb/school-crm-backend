import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { UpdateCostCategoryDto } from './dto/update-cost-category.dto';
import { InjectModel } from '@nestjs/sequelize';
import { CostCategory } from './models/cost-category.model';

@Injectable()
export class CostCategoryService {
  constructor(@InjectModel(CostCategory) private repo: typeof CostCategory) {}

  async create(createCostCategoryDto: CreateCostCategoryDto) {
    const cost = await this.repo.create(createCostCategoryDto);
    return {
      message: 'Cost category created successfully',
      cost,
    };
  }

  async findAllBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'name']
    });
  }

  async remove(id: number, school_id: number) {
    const cost = await this.repo.findOne({ where: { id, school_id } });
    await cost.destroy();

    return {
      message: 'Cost category removed successfully',
    };
  }
}
