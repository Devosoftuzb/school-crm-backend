import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { InjectModel } from '@nestjs/sequelize';
import { School } from './models/school.model';
import { FilesService } from 'src/common/files/files.service';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School) private repo: typeof School,
    private readonly fileService: FilesService,
  ) {}

  async create(createSchoolDto: CreateSchoolDto, image: any) {
    let image_name: string;
    image_name = await this.fileService.createFile(image);
    const school = await this.repo.create({
      image: image_name,
      ...createSchoolDto,
    });
    return {
      message: 'School created successfully',
      school,
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
    const school = await this.repo.findByPk(id);

    if (!school) {
      throw new BadRequestException(`School with id ${id} not found`);
    }

    return school;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto, image: any) {
    const school = await this.findOne(id);

    if (image) {
      let image_name: string;
      try {
        if (school.image !== null) {
          try {
            await this.fileService.deleteFile(school.image);
          } catch (error) {
            // throw new BadRequestException(error.message);
          }
        }
        image_name = await this.fileService.createFile(image);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      await school.update({
        image: image_name,
        ...updateSchoolDto,
      });
      return {
        message: 'Success',
        school,
      };
    }
    await school.update(updateSchoolDto);
    return {
      message: 'Success',
      school,
    };
  }

  async remove(id: number) {
    const school = await this.findOne(id);

    if (school.image !== null) {
      try {
        await this.fileService.deleteFile(school.image);
      } catch (error) {
        school.destroy();
        // throw new BadRequestException(error.message);
      }
    }
    school.destroy();
    return {
      message: 'Success',
    };
  }
}
