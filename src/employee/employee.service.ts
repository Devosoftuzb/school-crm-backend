import { EmployeeSubject } from './../employee_subject/models/employee_subject.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from './models/employee.model';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { Op } from 'sequelize';
import { ChangePasswordDto } from './dto/changePassword.dto';

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

  async findBySchoolId(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      include: [
        {
          model: EmployeeGroup,
        },
        {
          model: EmployeeSubject,
        },
      ],
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const whereClause: any = { school_id, role: 'teacher' };

      const employees = await this.repo.findAll({
        where: whereClause,
        include: [
          {
            model: EmployeeGroup,
          },
          {
            model: EmployeeSubject,
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      // teacher bo'lmagan xodimlarni ham kiritish uchun yana bir so'rov
      const nonTeacherEmployees = await this.repo.findAll({
        where: { school_id, role: { [Op.ne]: 'teacher' } },
        offset,
        limit,
      });

      const total_count = await this.repo.count({ where: { school_id } });
      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records: [...employees, ...nonTeacherEmployees],
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

  async findOneNot(id: number, school_id: number) {
    const employee = await this.repo.findOne({
      where: { id, school_id },
      attributes: ['full_name', 'role', 'phone_number'],
    });

    if (!employee) {
      throw new BadRequestException(
        `Employee ith id ${id} not found in school ${school_id}`,
      );
    }
    return employee;
  }

  async findOneFullName(id: number, school_id: number) {
    const employee = await this.repo.findOne({
      where: { id, school_id },
      attributes: ['full_name'],
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
    const existingEmployee = await this.repo.findOne({
      where: { login: updateEmployeeDto.login },
    });

    const userExists = await this.repoUser.findOne({
      where: { login: updateEmployeeDto.login },
    });

    if (existingEmployee || userExists) {
      throw new BadRequestException(
        `Login "${updateEmployeeDto.login}" already exists`,
      );
    }

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

  async changePassword(
    school_id: number,
    id: number,
    changePasswordDto: ChangePasswordDto,
  ) {
    const { old_password, new_password } = changePasswordDto;
    const employee = await this.findOne(id, school_id);

    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      employee.hashed_password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('The current password did not match!');
    }

    const hashedPassword = await bcrypt.hash(new_password, 7);

    await this.repo.update(
      { hashed_password: hashedPassword },
      { where: { id } },
    );

    return {
      message: 'Password changed successfully',
    };
  }
}
