import { Module } from '@nestjs/common';
import { EmployeeSubjectService } from './employee_subject.service';
import { EmployeeSubjectController } from './employee_subject.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmployeeSubject } from './models/employee_subject.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([EmployeeSubject]), JwtModule],
  controllers: [EmployeeSubjectController],
  providers: [EmployeeSubjectService],
})
export class EmployeeSubjectModule {}
