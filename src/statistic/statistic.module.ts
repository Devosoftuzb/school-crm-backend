import { School } from 'src/school/models/school.model';
import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { Student } from 'src/student/models/student.model';
import { Employee } from 'src/employee/models/employee.model';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';

@Module({
  imports: [SequelizeModule.forFeature([School, Student, Employee, Group, Payment]), JwtModule],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
