import { Module } from '@nestjs/common';
import { StudentAnswerService } from './student_answer.service';
import { StudentAnswerController } from './student_answer.controller';

@Module({
  controllers: [StudentAnswerController],
  providers: [StudentAnswerService],
})
export class StudentAnswerModule {}
