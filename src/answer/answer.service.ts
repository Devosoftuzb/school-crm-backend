import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Answer } from './models/answer.model';
import { AnswerDto } from './dto/answer.dto';

@Injectable()
export class AnswerService {
  constructor(@InjectModel(Answer) private answerRepository: typeof Answer) {}

  async create(answerDto: AnswerDto): Promise<object> {
    try {
      const answer = await this.answerRepository.create(answerDto);
      if (!answer) {
        throw new BadRequestException('Javob yaratishda xatolik!');
      }
      return { message: "Javob variantlari qo'shildi" };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Answer[]> {
    try {
      const answers = await this.answerRepository.findAll({
        include: { all: true },
      });
      if (!answers.length) {
        throw new BadRequestException("Javoblar ro'yxati bo'sh!");
      }
      return answers;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number): Promise<Answer> {
    try {
      const answer = await this.answerRepository.findByPk(id);
      if (!answer) {
        throw new BadRequestException('Javob topilmadi!');
      }
      return answer;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, answerDto: AnswerDto): Promise<object> {
    try {
      const answer = await this.answerRepository.findByPk(id);
      if (!answer) {
        throw new BadRequestException('Javob topilmadi!');
      }
      await this.answerRepository.update(answerDto, {
        where: { id },
        returning: true,
      });
      return { message: "Javob o'zgaritirildi" };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<object> {
    try {
      const answer = await this.answerRepository.findByPk(id);
      if (!answer) {
        throw new BadRequestException('Javob topilmadi!');
      }
      await this.answerRepository.destroy({ where: { id } });
      return { message: "Javob o'chirildi" };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
