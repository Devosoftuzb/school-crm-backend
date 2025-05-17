import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionTextDto } from './dto/create-question-text.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QuestionText } from './model/question-text.model';

@Injectable()
export class QuestionTextService {
  constructor(@InjectModel(QuestionText) private repo: typeof QuestionText) {}

  async create(createQuestionTextDto: CreateQuestionTextDto) {
    const questionText = await this.repo.create(createQuestionTextDto);
    return {
      message: 'Question text created successfully',
      questionText,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async findOne(id: number) {
    const questionText = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!questionText) {
      throw new BadRequestException(`Question text with id ${id} not found`);
    }

    return questionText;
  }

  async remove(id: number) {
    const questionText = await this.findOne(id);
    await questionText.destroy();

    return {
      message: 'Question text removed successfully',
    };
  }
}
