import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Room } from './models/room.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Room]), JwtModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
