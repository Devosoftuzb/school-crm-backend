import { Module } from '@nestjs/common';
import { CostService } from './cost.service';
import { CostController } from './cost.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cost } from './model/cost.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Cost]), JwtModule],
  controllers: [CostController],
  providers: [CostService],
})
export class CostModule {}
