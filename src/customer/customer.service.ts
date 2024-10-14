import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from './models/customer.model';

@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer) private repo: typeof Customer) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = await this.repo.create(createCustomerDto);
    return {
      message: 'Customer created successfully',
      customer,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      include: { all: true },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const customers = await this.repo.findAll({
        where: { school_id },
        include: { all: true },
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });
      const total_count = await this.repo.count({ where: { school_id } });
      const total_pages = Math.ceil(total_count / limit);
      return {
        status: 200,
        data: {
          records: customers,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to paginate customers: ' + error.message);
    }
  }

  async findOne(id: number, school_id: number) {
    const customer = await this.repo.findOne({
      where: { id, school_id },
      include: { all: true },
    });

    if (!customer) {
      throw new BadRequestException(`Customer with id ${id} not found in school ${school_id}`);
    }

    return customer;
  }

  async update(id: number, school_id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id, school_id);

    await customer.update(updateCustomerDto);

    return {
      message: 'Customer updated successfully',
      customer,
    };
  }

  async remove(id: number, school_id: number) {
    const customer = await this.findOne(id, school_id);
    await customer.destroy();

    return {
      message: 'Customer removed successfully',
    };
  }
}
