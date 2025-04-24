import { Module } from '@nestjs/common';
import { OptionService } from './option.service';
import { OptionController } from './option.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Option } from './model/option.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Option]), JwtModule],
  controllers: [OptionController],
  providers: [OptionService],
})
export class OptionModule {}
