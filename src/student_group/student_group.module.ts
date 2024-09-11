import { Module } from '@nestjs/common';
import { StudentGroupService } from './student_group.service';
import { StudentGroupController } from './student_group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentGroup } from './models/student_group.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([StudentGroup]), JwtModule],
  controllers: [StudentGroupController],
  providers: [StudentGroupService],
})
export class StudentGroupModule {}
