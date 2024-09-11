import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from 'src/student/models/student.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Payment, Student]), JwtModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
