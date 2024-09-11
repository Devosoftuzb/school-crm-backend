import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from './models/employee.model';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.model';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee) private repo: typeof Employee,
    @InjectModel(User) private repoUser: typeof User,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const employee = await this.repo.findOne({
      where: { login: createEmployeeDto.login },
    });

    const user = await this.repoUser.findOne({
      where: { login: createEmployeeDto.login },
    });

    if (employee || user) {
      throw new BadRequestException(
        `This login "${createEmployeeDto.login}" already exists`,
      );
    }
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 7);
    const newEmployee = await this.repo.create({
      ...createEmployeeDto,
      hashed_password: hashedPassword,
    });
    return {
      message: 'Employee created',
      employee: newEmployee,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findAllByEmployeeId(school_id: number) {
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
    const employee = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!employee) {
      throw new BadRequestException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  async update(
    id: number,
    school_id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!employee) {
      throw new BadRequestException(`Employee with id ${id} not found`);
    }

    await employee.update(updateEmployeeDto);

    return {
      message: 'Employee update',
      employee,
    };
  }

  async remove(id: number, school_id: number) {
    const employee = await this.repo.findOne({
      where: {
        id: id,
        school_id: school_id,
      },
      include: { all: true },
    });

    if (!employee) {
      throw new BadRequestException(`Employee with id ${id} not found`);
    }

    await employee.destroy();

    return {
      message: 'Employee remove',
    };
  }
}
