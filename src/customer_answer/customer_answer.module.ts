import { CustomerTest } from './../customer_test/model/customer_test.model';
import { Module } from '@nestjs/common';
import { CustomerAnswerService } from './customer_answer.service';
import { CustomerAnswerController } from './customer_answer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerAnswer } from './model/customer_answer.model';
import { JwtModule } from '@nestjs/jwt';
import { Option } from 'src/option/model/option.model';
import { ConfigModule } from '@nestjs/config';
import { Question } from 'src/questions/model/question.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forFeature([
      CustomerAnswer,
      Option,
      CustomerTest,
      Question,
    ]),
    JwtModule,
  ],
  controllers: [CustomerAnswerController],
  providers: [CustomerAnswerService],
})
export class CustomerAnswerModule {}
