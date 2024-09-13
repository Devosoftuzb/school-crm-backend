import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Question } from './models/question.model';
import { QuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question) private questionRepository: typeof Question,
  ) {}

  async create(questionDto: QuestionDto): Promise<object> {
    try {
      const question = await this.questionRepository.create(questionDto);
      if (!question) {
        throw new BadRequestException('Savol yaratishda xatolik!');
      }
      return { message: "Savol ro'yxatga qo'shildi", id: question.id };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Question[]> {
    try {
      const questions = await this.questionRepository.findAll({
        include: { all: true },
      });
      if (!questions.length) {
        throw new BadRequestException("Savollar ro'yxati bo'sh!");
      }
      return questions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number): Promise<Question> {
    try {
      const question = await this.questionRepository.findByPk(id, {
        include: { all: true },
      });
      if (!question) {
        throw new BadRequestException('Savol topilmadi!');
      }
      return question;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, questionDto: QuestionDto): Promise<object> {
    try {
      const question = await this.questionRepository.findByPk(id, {
        include: { all: true },
      });
      if (!question) {
        throw new BadRequestException('Savol topilmadi!');
      }
      await this.questionRepository.update(questionDto, {
        where: { id },
        returning: true,
      });
      return { message: "Savol o'zgartirildi", question };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<object> {
    try {
      const question = await this.findOne(id);
      question.destroy();
      return { message: "Savol ro'yxatdan o'chirildi", question };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
