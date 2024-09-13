import { Module } from '@nestjs/common';
import { TestGroupService } from './test-group.service';
import { TestGroupController } from './test-group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestGroup } from './models/test-group.model';
import { Subject } from 'src/subject/models/subject.model';
import { JwtModule } from '@nestjs/jwt';
import { QuestionModule } from 'src/question/question.module';
import { TestSubmitModule } from 'src/test-submit/test-submit.module';
import { TestTimeModule } from 'src/test-time/test-time.module';

@Module({
  imports: [
    SequelizeModule.forFeature([TestGroup, Subject]),
    JwtModule.register({}),
  ],
  controllers: [TestGroupController],
  providers: [TestGroupService],
})
export class TestGroupModule {}
