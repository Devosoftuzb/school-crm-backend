import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeSubjectDto } from './dto/create-employee_subject.dto';
import { InjectModel } from '@nestjs/sequelize';
import { EmployeeSubject } from './models/employee_subject.model';

@Injectable()
export class EmployeeSubjectService {
  constructor(
    @InjectModel(EmployeeSubject) private repo: typeof EmployeeSubject,
  ) {}

  async create(createEmployeeSubjectDto: CreateEmployeeSubjectDto) {
    const employeeSubject = await this.repo.create(createEmployeeSubjectDto);
    return {
      message: 'Employee Subject created successfully',
      employeeSubject,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findOne(id: number) {
    const employeeSubject = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!employeeSubject) {
      throw new BadRequestException(`Employee Subject with id ${id} not found`);
    }

    return employeeSubject;
  }

  async remove(id: number) {
    const employeeSubject = await this.findOne(id);
    await employeeSubject.destroy();

    return {
      message: 'Employee Subject removed successfully',
    };
  }
}
