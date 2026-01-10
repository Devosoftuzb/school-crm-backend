import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Student } from './models/student.model';
import { JwtModule } from '@nestjs/jwt';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';

@Module({
  imports: [SequelizeModule.forFeature([Student, EmployeeGroup, StudentGroup]), JwtModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
