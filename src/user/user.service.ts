import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private repo: typeof User) {}

  async onModuleInit() {
    const existingSuperAdmin = await this.repo.findOne({
      where: { role: 'superadmin' },
    });
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('qwerty', 7);
      const defaultSuperAdminDto = {
        full_name: 'John Doe',
        phone_number: '+99890124567',
        login: 'john',
        hashed_password: hashedPassword,
        role: 'superadmin',
      };

      const createdUser = await this.repo.create(defaultSuperAdminDto);

      const response = {
        message: 'Super Admin created',
        user: createdUser,
      };
      return response;
    }
  }

  async create(createUserDto: CreateUserDto, res: Response) {
    const user = await this.repo.findOne({
      where: { login: createUserDto.login },
    });

    if (user) {
      throw new BadRequestException(
        `This login "${createUserDto.login}" already exists`,
      );
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 7);
    const newUser = await this.repo.create({
      ...createUserDto,
      hashed_password: hashedPassword,
    });
    return {
      message: 'User created',
      user: newUser,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
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
    const user = await this.repo.findByPk(id, { include: { all: true } });
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.repo.findByPk(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }

    await user.update(updateUserDto);

    return {
      message: 'User updated',
      user,
    };
  }

  async delete(id: number) {
    const user = await this.repo.findByPk(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }

    await user.destroy();

    return {
      message: 'User deleted',
    };
  }
}
