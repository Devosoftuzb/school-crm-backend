import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from './models/room.model';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room) private repo: typeof Room) {}

  async onModuleInit() {
    const count = await this.repo.count();

    if (count === 0) {
      await this.repo.create({
        name: 'Default Room',
        status: 'status',
      });
      console.log('✅ Default room created automatically');
    }
  }

  async create(createRoomDto: CreateRoomDto) {
    const school = await this.repo.create(createRoomDto);
    return {
      message: 'Room created successfully',
      school,
    };
  }

  async findAll(school_id: number) {
    return await this.repo.findAll({ where: { school_id } });
  }

  async remove(id: number) {
    const room = await this.repo.findByPk(id);
    await room.destroy();

    return {
      message: 'Room removed successfully',
    };
  }
}
