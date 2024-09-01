import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { School } from './models/school.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([School]), JwtModule],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
