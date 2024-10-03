import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeGroupDto } from './dto/create-employee_group.dto';
import { InjectModel } from '@nestjs/sequelize';
import { EmployeeGroup } from './models/employee_group.model';

@Injectable()
export class EmployeeGroupService {
  constructor(@InjectModel(EmployeeGroup) private repo: typeof EmployeeGroup) {}

  async create(createEmployeeGroupDto: CreateEmployeeGroupDto) {
    const employeeGroup = await this.repo.create(createEmployeeGroupDto);
    return {
      message: 'Employee Group created successfully',
      employeeGroup,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findOne(id: number) {
    const employeeGroup = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!employeeGroup) {
      throw new BadRequestException(`Employee Group with id ${id} not found`);
    }

    return employeeGroup;
  }

  async remove(id: number) {
    const employeeGroup = await this.findOne(id);
    await employeeGroup.destroy();

    return {
      message: 'Employee Group removed successfully',
    };
  }
}
