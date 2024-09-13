import { Module } from '@nestjs/common';
import { TestTimeService } from './test-time.service';
import { TestTimeController } from './test-time.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestTime } from './models/test-time.model';
import { Student } from 'src/student/models/student.model';
import { TestGroup } from 'src/test-group/models/test-group.model';
import { StudentModule } from 'src/student/student.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([TestTime, Student, TestGroup]),
    JwtModule.register({}),
  ],
  controllers: [TestTimeController],
  providers: [TestTimeService],
})
export class TestTimeModule {}
