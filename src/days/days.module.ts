import { Module } from '@nestjs/common';
import { DaysService } from './days.service';
import { DaysController } from './days.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Day } from './models/day.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Day]), JwtModule],
  controllers: [DaysController],
  providers: [DaysService],
})
export class DaysModule {}
