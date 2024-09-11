import { Module } from '@nestjs/common';
import { GroupSubjectService } from './group_subject.service';
import { GroupSubjectController } from './group_subject.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupSubject } from './models/group_subject.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([GroupSubject]), JwtModule],
  controllers: [GroupSubjectController],
  providers: [GroupSubjectService],
})
export class GroupSubjectModule {}
