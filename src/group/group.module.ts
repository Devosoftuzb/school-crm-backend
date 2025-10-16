import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { JwtModule } from '@nestjs/jwt';
import { StudentGroup } from 'src/student_group/models/student_group.model';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { GroupSubject } from 'src/group_subject/models/group_subject.model';
import { GroupDay } from 'src/group_day/models/group_day.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Group,
      StudentGroup,
      EmployeeGroup,
      GroupSubject,
      GroupDay,
    ]),
    JwtModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
