import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from './model/notification.model';
import { FilesService } from 'src/common/files/files.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { partnersConfig } from 'src/common/config/partners';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification) private repo: typeof Notification,
    private readonly fileService: FilesService,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateNotificationDto, image?: any) {
    try {
      let image_name: string | null = null;

      if (image) {
        image_name = await this.fileService.createFile(image);
      }

      if (dto.type === 'SUBSCRIPTION') {
        const notification = await this.repo.create({
          image: image_name,
          title: dto.title,
          note: dto.note,
        });

        return {
          message: 'Notification created successfully',
          notification,
        };
      }

      if (dto.type === 'PURCHASE') {
        await this.sendToAllPartners(dto, image_name);

        return {
          message: 'Notification sent to partner server successfully',
        };
      }

      throw new BadRequestException('Invalid notification target');
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Create notification failed',
      );
    }
  }

  private async getPartnerToken(
    partner: (typeof partnersConfig)[0],
  ): Promise<string> {
    try {
      const response$ = this.httpService.post(
        `${partner.url}/api/auth/v1/login`,
        {
          username: process.env[partner.userEnv],
          password: process.env[partner.passEnv],
        },
        { timeout: Number(5000) },
      );

      const response = await lastValueFrom(response$);

      if (!response.data?.token) {
        throw new BadRequestException(`Login failed for ${partner.name}`);
      }

      return response.data.token;
    } catch (error) {
      throw new BadRequestException(`Login failed for ${partner.name}`);
    }
  }

  private async sendToAllPartners(dto: CreateNotificationDto, image_name?: string) {
    const results = [];

    for (const partner of partnersConfig) {
      try {
        const token = await this.getPartnerToken(partner);

        const payload: any = {
          title: dto.title,
          note: dto.note,
        };
        if (image_name) payload.image = image_name;

        const response$ = this.httpService.post(
          `${partner.url}/api/v2/notifications`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        await lastValueFrom(response$);

        results.push({ partner: partner.name, status: 'success' });
      } catch (error) {
        console.error(`Failed to send notification to ${partner.name}`);
        results.push({ partner: partner.name, status: 'failed' });
      }
    }

    return {
      message: 'Notifications sent (where possible)',
      results,
    };
  }

  async findAll() {
    return await this.repo.findAll({ order: [['createdAt', 'DESC']] });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;

      const records = await this.repo.findAll({
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      const total_count = await this.repo.count();
      const total_pages = Math.ceil(total_count / limit);

      return {
        status: 200,
        data: {
          records,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    const notification = await this.repo.findByPk(id);

    if (!notification) {
      throw new BadRequestException(`Notification with id ${id} not found`);
    }

    return notification;
  }

  async remove(id: number) {
    const notification = await this.findOne(id);

    try {
      if (notification.image) {
        await this.fileService.deleteFile(notification.image);
      }

      await this.repo.destroy({ where: { id } });

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Delete failed');
    }
  }
}
