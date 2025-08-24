import { Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Salary } from './models/salary.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Salary]), JwtModule],
  controllers: [SalaryController],
  providers: [SalaryService],
})
export class SalaryModule {}
