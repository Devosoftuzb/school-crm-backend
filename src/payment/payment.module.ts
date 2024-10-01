import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';
import { JwtModule } from '@nestjs/jwt';
import { Group } from 'src/group/models/group.model';
import { Employee } from 'src/employee/models/employee.model';

@Module({
  imports: [SequelizeModule.forFeature([Payment, Student, Group, Employee]), JwtModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
