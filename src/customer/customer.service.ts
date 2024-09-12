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
      message: 'Customer created',
      customer,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllByCustomerId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id: school_id },
      include: { all: true },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
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
    const customer = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!customer) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    return customer;
  }

  async update(
    id: number,
    school_id: number,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!customer) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    await customer.update(updateCustomerDto);

    return {
      message: 'Customer update',
      customer,
    };
  }

  async remove(id: number, school_id: number) {
    const customer = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!customer) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    await customer.destroy();

    return {
      message: 'Customer remove',
    };
  }
}
