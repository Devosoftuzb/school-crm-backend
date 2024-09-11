import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaymentMethodController } from './payment_method.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentMethod } from './models/payment_method.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([PaymentMethod]), JwtModule],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService],
})
export class PaymentMethodModule {}
