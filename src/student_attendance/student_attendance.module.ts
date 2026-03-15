import { Module } from '@nestjs/common';
import { StudentAttendanceService } from './student_attendance.service';
import { StudentAttendanceController } from './student_attendance.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentAttendance } from './models/student_attendance.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([StudentAttendance]), JwtModule],
  controllers: [StudentAttendanceController],
  providers: [StudentAttendanceService],
})
export class StudentAttendanceModule {}
