import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from './models/room.model';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room) private repo: typeof Room) {}

  async create(createRoomDto: CreateRoomDto) {
    const school = await this.repo.create(createRoomDto);
    return {
      message: 'Room created successfully',
      school,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        include: { all: true },
        offset,
        limit,
      });
      const total_count = await this.repo.count();
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: user,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    const room = await this.repo.findByPk(id, { include: { all: true } });

    if (!room) {
      throw new BadRequestException(`Room with id ${id} not found`);
    }

    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const room = await this.findOne(id);
    await room.update(updateRoomDto);

    return {
      message: 'Room updated successfully',
      room,
    };
  }

  async remove(id: number) {
    const room = await this.findOne(id);
    await room.destroy();

    return {
      message: 'Room removed successfully',
    };
  }
}
