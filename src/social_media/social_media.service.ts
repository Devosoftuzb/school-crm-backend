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

  async remove(id: number, school_id: number) {
    const socialMedia = await this.repo.findOne({ where: { id, school_id } });
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
