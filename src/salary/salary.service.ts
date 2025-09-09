import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Salary } from './models/salary.model';
import { Op, fn, col, where } from 'sequelize';

@Injectable()
export class SalaryService {
  constructor(@InjectModel(Salary) private repo: typeof Salary) {}

  async create(createSalaryDto: CreateSalaryDto) {
    const salary = await this.repo.create(createSalaryDto);
    return {
      message: 'Salary created successfully',
      salary,
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
      
      const salary = await this.repo.findAll({
        where: {
          school_id,
          [Op.and]: [
            where(fn('MONTH', col('Salary.createdAt')), Number(month)),
            where(fn('YEAR', col('Salary.createdAt')), Number(year)),
          ],
        },
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count({
        where: {
          school_id,
          [Op.and]: [
            where(fn('MONTH', col('Salary.createdAt')), Number(month)),
            where(fn('YEAR', col('Salary.createdAt')), Number(year)),
          ],
        },
      });
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: salary,
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
    const salary = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: { all: true },
    });

    if (!salary) {
      throw new BadRequestException(`Salary with id ${id} not found`);
    }

    return salary;
  }

  async update(
    id: number,
    school_id: number,
    updateSalaryDto: UpdateSalaryDto,
  ) {
    const salary = await this.findOne(id, school_id);
    await salary.update(updateSalaryDto);

    return {
      message: 'Salary updated successfully',
      salary,
    };
  }

  async remove(id: number, school_id: number) {
    const salary = await this.findOne(id, school_id);
    await salary.destroy();

    return {
      message: 'Salary removed successfully',
    };
  }
}
