import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerTestDto } from './dto/create-customer_test.dto';
import { UpdateCustomerTestDto } from './dto/update-customer_test.dto';
import { InjectModel } from '@nestjs/sequelize';
import { CustomerTest } from './model/customer_test.model';

@Injectable()
export class CustomerTestService {
  constructor(@InjectModel(CustomerTest) private repo: typeof CustomerTest) {}

  async create(createCustomerTestDto: CreateCustomerTestDto) {
    const customer_test = await this.repo.create(createCustomerTestDto);
    return {
      message: 'Customer Test created successfully',
      customer_test,
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
    const customer_test = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!customer_test) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    return customer_test;
  }

  async update(id: number, updateCustomerTestDto: UpdateCustomerTestDto) {
    const customer_test = await this.findOne(id);
    await customer_test.update(updateCustomerTestDto);

    return {
      message: 'Customer Test updated successfully',
      customer_test,
    };
  }

  async remove(id: number) {
    const customer_test = await this.findOne(id);
    await customer_test.destroy();

    return {
      message: 'Customer Test removed successfully',
    };
  }
}
