import { Module } from '@nestjs/common';
import { CostCategoryService } from './cost-category.service';
import { CostCategoryController } from './cost-category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CostCategory } from './models/cost-category.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([CostCategory]), JwtModule],
  controllers: [CostCategoryController],
  providers: [CostCategoryService],
})
export class CostCategoryModule {}
