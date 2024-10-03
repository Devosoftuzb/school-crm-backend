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
    const existingEmployee = await this.repo.findOne({
      where: { login: createEmployeeDto.login },
    });

    const userExists = await this.repoUser.findOne({
      where: { login: createEmployeeDto.login },
    });

    if (existingEmployee || userExists) {
      throw new BadRequestException(
        `Login "${createEmployeeDto.login}" already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 7);
    const newEmployee = await this.repo.create({
      ...createEmployeeDto,
      hashed_password: hashedPassword,
    });
    return {
      message: 'Employee created successfully',
      employee: newEmployee,
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
      const employees = await this.repo.findAll({
        where: { school_id },
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count({ where: { school_id } });
      const total_pages = Math.ceil(total_count / limit);
      return {
        status: 200,
        data: {
          records: employees,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to paginate employees: ' + error.message,
      );
    }
  }

  async findOne(id: number, school_id: number) {
    const employee = await this.repo.findOne({
      where: { id, school_id },
      include: { all: true },
    });

    if (!employee) {
      throw new BadRequestException(
        `Employee ith id ${id} not found in school ${school_id}`,
      );
    }
    return employee;
  }

  async update(
    id: number,
    school_id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee = await this.findOne(id, school_id);
    await employee.update(updateEmployeeDto);

    return {
      message: 'Employee updated successfully',
      employee,
    };
  }

  async remove(id: number, school_id: number) {
    const employee = await this.findOne(id, school_id);
    await employee.destroy();

    return {
      message: 'Employee removed successfully',
    };
  }
}
