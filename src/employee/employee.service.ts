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
import { Group } from 'src/group/models/group.model';
import { Subject } from 'src/subject/models/subject.model';
import { ResetPasswordDto } from './dto/resertPassword.dto';
import { GroupSubject } from 'src/group_subject/models/group_subject.model';

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

  async findAll(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
    });
  }

  // async findBySchoolId(school_id: number) {
  //   return await this.repo.findAll({
  //     where: { school_id },
  //     include: [
  //       {
  //         model: EmployeeGroup,
  //         include: [{ model: Group, attributes: ['id', 'name'] }],
  //       },
  //       {
  //         model: EmployeeSubject,
  //       },
  //     ],
  //   });
  // }

  async paginate(
    school_id: number,
    role: string,
    page: number,
  ): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;

      const whereClause: any = { school_id, role };

      const employees = await this.repo.findAll({
        where: whereClause,
        attributes: ['id', 'full_name', 'phone_number', 'role', 'createdAt'],
        include: [
          {
            model: EmployeeGroup,
            attributes: ['id'],
            include: [{ model: Group, attributes: ['id', 'name'] }],
          },
          {
            model: EmployeeSubject,
            attributes: ['id'],
            include: [{ model: Subject, attributes: ['id', 'name'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      const total_count = await this.repo.count({ where: whereClause });
      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records: [...employees],
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
      attributes: [
        'id',
        'full_name',
        'phone_number',
        'role',
        'salary',
        'createdAt',
      ],
      include: [
        {
          model: EmployeeGroup,
          attributes: ['id', 'createdAt'],
          include: [
            {
              model: Group,
              attributes: ['id', 'name', 'price', 'start_date'],
              include: [
                {
                  model: GroupSubject,
                  include: [{ model: Subject, attributes: ['name'] }],
                },
              ],
            },
          ],
        },
      ],
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
      attributes: [
        'id',
        'full_name',
        'role',
        'phone_number',
        'login',
        'salary',
      ],
    });

    if (!employee) {
      throw new BadRequestException(
        `Employee ith id ${id} not found in school ${school_id}`,
      );
    }
    return employee;
  }

  // async findOneSubject(id: number, school_id: number) {
  //   const employee = await this.repo.findOne({
  //     where: { id, school_id },
  //     attributes: [],
  //     include: [
  //       {
  //         model: EmployeeSubject,
  //       },
  //     ],
  //   });

  //   if (!employee) {
  //     throw new BadRequestException(
  //       `Employee ith id ${id} not found in school ${school_id}`,
  //     );
  //   }
  //   return employee;
  // }

  // async findOneGroup(id: number, school_id: number) {
  //   const employee = await this.repo.findOne({
  //     where: { id, school_id },
  //     attributes: [],
  //     include: [
  //       {
  //         model: EmployeeGroup,
  //       },
  //     ],
  //   });

  //   if (!employee) {
  //     throw new BadRequestException(
  //       `Employee ith id ${id} not found in school ${school_id}`,
  //     );
  //   }
  //   return employee;
  // }

  // async findOneFullName(id: number, school_id: number) {
  //   const employee = await this.repo.findOne({
  //     where: { id, school_id },
  //     attributes: ['full_name'],
  //   });

  //   if (!employee) {
  //     throw new BadRequestException(
  //       `Employee ith id ${id} not found in school ${school_id}`,
  //     );
  //   }
  //   return employee;
  // }

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

    if (
      (existingEmployee && existingEmployee.id != id) ||
      (userExists && userExists.id != id)
    ) {
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
    const employee = await this.repo.findOne({ where: { id, school_id } });

    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      employee.hashed_password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Kiritilgan eski parol noto‘g‘ri!');
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

  async resetPassword(
    school_id: number,
    id: number,
    resetPasswordDto: ResetPasswordDto,
  ) {
    const { new_password } = resetPasswordDto;

    const hashedPassword = await bcrypt.hash(new_password, 7);

    await this.repo.update(
      { hashed_password: hashedPassword },
      { where: { id, school_id } },
    );

    return {
      message: 'Password changed successfully',
    };
  }

  async findAllWeb() {
    return await this.repo.findAll({
      where: { school_id: 6, role: 'teacher' },
      attributes: ['full_name'],
    });
  }

  async searchName(school_id: number, role: string, name: string) {
    return await this.repo.findAll({
      where: { school_id, role, full_name: { [Op.iLike]: `%${name}%` } },
      include: [
        {
          model: EmployeeSubject,
          include: [{ model: Subject, attributes: ['id', 'name'] }],
        },
        {
          model: EmployeeGroup,
          include: [{ model: Group, attributes: ['id', 'name'] }],
        },
      ],
      attributes: ['id', 'full_name', 'phone_number', 'role'],
    });
  }

  async findAdd(school_id: number) {
    return await this.repo.findAll({
      where: { school_id, role: 'teacher' },
      attributes: ['id', 'full_name'],
    });
  }
}
