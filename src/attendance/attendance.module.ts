import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attendance } from './models/attendance.model';
import { JwtModule } from '@nestjs/jwt';
import { Student } from 'src/student/models/student.model';

@Module({
  imports: [SequelizeModule.forFeature([Attendance, Student]), JwtModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
