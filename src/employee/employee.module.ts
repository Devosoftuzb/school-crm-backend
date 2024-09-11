import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Employee } from './models/employee.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Employee, User]), JwtModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
