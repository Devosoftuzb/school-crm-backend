import { Module } from '@nestjs/common';
import { QuestionTextService } from './question-text.service';
import { QuestionTextController } from './question-text.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuestionText } from './model/question-text.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([QuestionText]), JwtModule],
  controllers: [QuestionTextController],
  providers: [QuestionTextService],
})
export class QuestionTextModule {}
