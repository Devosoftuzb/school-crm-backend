import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Question } from './model/question.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/common/files/files.module';

@Module({
  imports: [SequelizeModule.forFeature([Question]), FilesModule, JwtModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
