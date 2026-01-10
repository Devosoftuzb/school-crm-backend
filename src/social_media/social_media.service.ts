import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSocialMediaDto } from './dto/create-social_media.dto';
import { UpdateSocialMediaDto } from './dto/update-social_media.dto';
import { InjectModel } from '@nestjs/sequelize';
import { SocialMedia } from './models/social_media.model';

@Injectable()
export class SocialMediaService {
  constructor(@InjectModel(SocialMedia) private repo: typeof SocialMedia) {}

  async create(createSocialMediaDto: CreateSocialMediaDto) {
    const socialMedia = await this.repo.create(createSocialMediaDto);
    return {
      message: 'Social Media created successfully',
      socialMedia,
    };
  }

  async findAll(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
    });
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id: school_id },
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

  async findOne(id: number, school_id: number) {
    const socialMedia = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
      include: { all: true },
    });

    if (!socialMedia) {
      throw new BadRequestException(`Social Media with id ${id} not found`);
    }

    return socialMedia;
  }

  async update(
    id: number,
    school_id: number,
    updateSocialMediaDto: UpdateSocialMediaDto,
  ) {
    const socialMedia = await this.findOne(id, school_id);
    await socialMedia.update(updateSocialMediaDto);

    return {
      message: 'Social Media updated successfully',
      socialMedia,
    };
  }

  async remove(id: number, school_id: number) {
    const socialMedia = await this.findOne(id, school_id);
    await socialMedia.destroy();

    return {
      message: 'Social Media removed successfully',
    };
  }

  async findAdd(school_id: number) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'name'],
    });
  }
}
