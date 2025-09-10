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
import { PaymentMethod } from 'src/payment_method/models/payment_method.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { Cost } from 'src/cost/model/cost.model';
import { Salary } from 'src/salary/models/salary.model';
import { CostCategory } from 'src/cost-category/models/cost-category.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      School,
      Student,
      Employee,
      Group,
      Payment,
      PaymentMethod,
      EmployeeGroup,
      StudentGroup,
      Cost,
      Salary,
      CostCategory,
    ]),
    JwtModule,
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
