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
  
    async findAll() {
      return await this.repo.findAll({ include: { all: true } });
    }
  
    async findAllBySchoolId(school_id: number) {
      return await this.repo.findAll({
        where: { school_id },
      });
    }
  
    async paginate(school_id: number, page: number): Promise<object> {
      try {
        page = Number(page);
        const limit = 15;
        const offset = (page - 1) * limit;
        const cost = await this.repo.findAll({
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
        throw new BadRequestException(`Cost category with id ${id} not found`);
      }
  
      return cost;
    }
  
    async update(
      id: number,
      school_id: number,
      updateCostCategoryDto: UpdateCostCategoryDto,
    ) {
      const cost = await this.findOne(id, school_id);
      await cost.update(updateCostCategoryDto);
  
      return {
        message: 'Cost category updated successfully',
        cost,
      };
    }
  
    async remove(id: number, school_id: number) {
      const cost = await this.findOne(id, school_id);
      await cost.destroy();
  
      return {
        message: 'Cost category removed successfully',
      };
    }
}
