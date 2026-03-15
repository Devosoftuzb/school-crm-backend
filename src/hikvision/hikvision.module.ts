// hikvision.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HikvisionService } from './hikvision.service';
import { HikvisionController } from './hikvision.controller';
import { Student } from 'src/student/models/student.model';
import { StudentAttendance } from 'src/student_attendance/models/student_attendance.model';

@Module({
  imports: [SequelizeModule.forFeature([Student, StudentAttendance])],
  providers: [HikvisionService],
  controllers: [HikvisionController],
  exports: [HikvisionService],
})
export class HikvisionModule {}
