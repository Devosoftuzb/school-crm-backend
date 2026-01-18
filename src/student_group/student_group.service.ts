import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student_group.dto';
import { InjectModel } from '@nestjs/sequelize';
import { StudentGroup } from './models/student_group.model';

@Injectable()
export class StudentGroupService {
  constructor(@InjectModel(StudentGroup) private repo: typeof StudentGroup) {}

  async create(createStudentGroupDto: CreateStudentGroupDto) {
    const oldStudentGroup = await this.repo.findOne({
      where: {
        student_id: createStudentGroupDto.student_id,
        group_id: createStudentGroupDto.group_id,
      },
    });

    if (oldStudentGroup) {
      throw new BadRequestException(`This group already exists`);
    }
    const studentGroup = await this.repo.create(createStudentGroupDto);
    return {
      message: 'Student Group created successfully',
      studentGroup,
    };
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
    const studentGroup = await this.findOne(id);
    await studentGroup.destroy();

    return {
      message: 'Student Group removed successfully',
    };
  }
}
