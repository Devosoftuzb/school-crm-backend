import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Answer } from './models/answer.model';
import { Question } from 'src/question/models/question.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([Answer, Question]),
    JwtModule.register({}),
  ],
  controllers: [AnswerController],
  providers: [AnswerService],
})
export class AnswerModule {}
