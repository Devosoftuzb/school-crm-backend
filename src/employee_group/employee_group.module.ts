import { Module } from '@nestjs/common';
import { EmployeeGroupService } from './employee_group.service';
import { EmployeeGroupController } from './employee_group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmployeeGroup } from './models/employee_group.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([EmployeeGroup]), JwtModule],
  controllers: [EmployeeGroupController],
  providers: [EmployeeGroupService],
})
export class EmployeeGroupModule {}
