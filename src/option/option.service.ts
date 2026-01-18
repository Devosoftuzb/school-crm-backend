import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Option } from './model/option.model';

@Injectable()
export class OptionService {
  constructor(@InjectModel(Option) private repo: typeof Option) {}

  async remove(id: number) {
    const option = await this.repo.findByPk(id);
    await option.destroy();

    return {
      message: 'Option removed successfully',
    };
  }
}
