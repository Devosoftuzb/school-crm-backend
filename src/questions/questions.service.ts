import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Question } from './model/question.model';
import { FilesService } from 'src/common/files/files.service';
import { Option } from 'src/option/model/option.model';
import { QuestionText } from 'src/question-text/model/question-text.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question) private repo: typeof Question,
    @InjectModel(Option) private repoOption: typeof Option,
    private readonly fileService: FilesService,
    private sequelize: Sequelize,
  ) {}

  async create(createQuestionDto: CreateQuestionDto, file: any) {
    const { options, ...questionData } = createQuestionDto;

    let file_name: string;
    if (file) {
      file_name = await this.fileService.createFile(file);
    }

    const question = await this.repo.create({
      ...questionData,
      file: file_name,
    });

    if (options && options.length) {
      const optionsData = options.map((opt) => ({
        ...opt,
        question_id: question.id,
      }));

      await this.repoOption.bulkCreate(optionsData);
    }

    return {
      message: 'Question created successfully',
      question_id: question.id,
    };
  }

  async findAll(test_id: number) {
    return await this.repo.findAll({
      where: { test_id },
      attributes: ['id', 'question', 'file'],
      include: [
        {
          model: Option,
          attributes: ['id', 'option', 'is_correct'],
          separate: true,
          order: [['id', 'ASC']],
        },
        {
          model: QuestionText,
          attributes: ['id', 'title', 'text'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  async findOne(id: number) {
    const question = await this.repo.findByPk(id, {
      attributes: ['id', 'question', 'file', 'text_id'],
      include: [
        {
          model: Option,
          attributes: ['id', 'option', 'is_correct'],
          separate: true,
          order: [['id', 'ASC']],
        },
      ],
    });

    if (!question) {
      throw new BadRequestException(`Question with id ${id} not found`);
    }

    return question;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto, file: any) {
    const question = await this.findOne(id);
    let file_name = question.file;

    if (file) {
      try {
        if (question.file !== null) {
          try {
            await this.fileService.deleteFile(question.file);
          } catch (error) {}
        }
        file_name = await this.fileService.createFile(file);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    updateQuestionDto.file = file_name;

    await this.sequelize.transaction(async (t) => {
      await question.update(updateQuestionDto, { transaction: t });

      const options = updateQuestionDto.options;
      if (options && options.length) {
        for (const opt of options) {
          if (opt.id) {
            await this.repoOption.update(
              { option: opt.option, is_correct: opt.is_correct },
              { where: { id: opt.id }, transaction: t },
            );
          } else {
            await this.repoOption.create(
              { ...opt, question_id: id },
              { transaction: t },
            );
          }
        }
      }
    });

    return {
      message: 'Question updated successfully',
      question,
    };
  }

  async remove(id: number) {
    const question = await this.findOne(id);

    if (question.file !== null) {
      try {
        await this.fileService.deleteFile(question.file);
      } catch (error) {
        question.destroy();
        // throw new BadRequestException(error.message);
      }
    }
    question.destroy();
    return {
      message: 'Success',
    };
  }
}
