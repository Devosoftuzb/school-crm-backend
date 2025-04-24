import { Module } from '@nestjs/common';
import { CustomerTestService } from './customer_test.service';
import { CustomerTestController } from './customer_test.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerTest } from './model/customer_test.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([CustomerTest]), JwtModule],
  controllers: [CustomerTestController],
  providers: [CustomerTestService],
})
export class CustomerTestModule {}
