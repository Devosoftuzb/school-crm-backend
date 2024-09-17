import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { School } from './models/school.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/common/files/files.module';

@Module({
  imports: [SequelizeModule.forFeature([School]), FilesModule, JwtModule],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
