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

  async findAll(test_id: number) {
    return await this.repo.findAll({
      where: { test_id },
      attributes: ['id', 'title']
    });
  }


  async remove(id: number) {
    const questionText = await this.repo.findByPk(id);
    await questionText.destroy();

    return {
      message: 'Question text removed successfully',
    };
  }
}
