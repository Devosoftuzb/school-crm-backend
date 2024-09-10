import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Day } from './models/day.model';

@Injectable()
export class DaysService {
  constructor(@InjectModel(Day) private repo: typeof Day) {}

  async onModuleInit() {
    const existingCategories = await this.repo.findAll();
    if (existingCategories.length === 0) {
      await this.repo.bulkCreate([
        { name: 'Monday' },
        { name: 'Tuesday' },
        { name: 'Wednesday' },
        { name: 'Thursday' },
        { name: 'Friday' },
        { name: 'Saturday' },
        { name: 'Sunday' },
      ]);
    }
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }
}
