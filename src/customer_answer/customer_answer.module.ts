import { Module } from '@nestjs/common';
import { CustomerAnswerService } from './customer_answer.service';
import { CustomerAnswerController } from './customer_answer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerAnswer } from './model/customer_answer.model';
import { JwtModule } from '@nestjs/jwt';
import { Option } from 'src/option/model/option.model';

@Module({
  imports: [SequelizeModule.forFeature([CustomerAnswer, Option]), JwtModule],
  controllers: [CustomerAnswerController],
  providers: [CustomerAnswerService],
})
export class CustomerAnswerModule {}
