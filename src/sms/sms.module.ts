import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { Group } from 'src/group/models/group.model';
import { Student } from 'src/student/models/student.model';
import { Attendance } from 'src/attendance/models/attendance.model';

@Module({
  imports: [SequelizeModule.forFeature([Group, Student, Attendance]), JwtModule],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
