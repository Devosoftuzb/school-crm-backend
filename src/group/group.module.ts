import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Group]), JwtModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
