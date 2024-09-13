import { Module } from '@nestjs/common';
import { TestSubmitService } from './test-submit.service';
import { TestSubmitController } from './test-submit.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestSubmit } from './models/test-submit.model';
import { Student } from 'src/student/models/student.model';
import { TestGroup } from 'src/test-group/models/test-group.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([TestSubmit, Student, TestGroup]),
    JwtModule.register({}),
  ],
  controllers: [TestSubmitController],
  providers: [TestSubmitService],
})
export class TestSubmitModule {}
