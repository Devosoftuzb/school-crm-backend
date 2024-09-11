import { Module } from '@nestjs/common';
import { GroupDayService } from './group_day.service';
import { GroupDayController } from './group_day.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupDay } from './models/group_day.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([GroupDay]), JwtModule],
  controllers: [GroupDayController],
  providers: [GroupDayService],
})
export class GroupDayModule {}
