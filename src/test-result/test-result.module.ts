import { Module } from '@nestjs/common';
import { TestResultService } from './test-result.service';
import { TestResultController } from './test-result.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestResult } from './models/test-result.model';
import { Student } from 'src/student/models/student.model';
import { TestGroup } from 'src/test-group/models/test-group.model';
import { JwtModule } from '@nestjs/jwt';
import { Question } from 'src/question/models/question.model';
import { TestTime } from 'src/test-time/models/test-time.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TestResult,
      Student,
      TestGroup,
      Question,
      TestTime,
    ]),
    JwtModule.register({}),
  ],
  controllers: [TestResultController],
  providers: [TestResultService],
})
export class TestResultModule {}
