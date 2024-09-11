import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student_group.dto';
import { InjectModel } from '@nestjs/sequelize';
import { StudentGroup } from './models/student_group.model';

@Injectable()
export class StudentGroupService {
  constructor(@InjectModel(StudentGroup) private repo: typeof StudentGroup) {}

  async create(createStudentGroupDto: CreateStudentGroupDto) {
    const studentGroup = await this.repo.create(createStudentGroupDto);
    return {
      message: 'Student Group created',
      studentGroup,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findOne(id: number) {
    const studentGroup = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!studentGroup) {
      throw new BadRequestException(`Student Group with id ${id} not found`);
    }

    return studentGroup;
  }

  async remove(id: number) {
    const studentGroup = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!studentGroup) {
      throw new BadRequestException(`Student Group with id ${id} not found`);
    }

    await studentGroup.destroy();

    return {
      message: 'Student Group remove',
    };
  }
}
