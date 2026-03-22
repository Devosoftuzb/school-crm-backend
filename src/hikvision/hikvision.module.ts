import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HikvisionService } from './hikvision.service';
import { HikvisionController } from './hikvision.controller';
import { Student } from 'src/student/models/student.model';
import { StudentAttendance } from 'src/student_attendance/models/student_attendance.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([Student, StudentAttendance]),
    JwtModule,
  ],
  providers: [HikvisionService],
  controllers: [HikvisionController],
  exports: [HikvisionService],
})
export class HikvisionModule implements OnModuleInit {
  private readonly logger = new Logger(HikvisionModule.name);

  constructor(private readonly hikvisionService: HikvisionService) {}

  onModuleInit() {
    this.logger.log('🔄 Hikvision polling ishga tushdi...');
    this.hikvisionService.pollEvents();
    setInterval(() => {
      this.hikvisionService.pollEvents();
    }, 10000);
  }
}
