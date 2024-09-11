import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { Employee } from 'src/employee/models/employee.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Employee]), JwtModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
