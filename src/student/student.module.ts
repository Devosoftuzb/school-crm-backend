import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Student } from './models/student.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Student]), JwtModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
