import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Question } from './model/question.model';
import { FilesService } from 'src/common/files/files.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question) private repo: typeof Question,
    private readonly fileService: FilesService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto, file: any) {
    let file_name: string;
    file_name = await this.fileService.createFile(file);
    const question = await this.repo.create({
      file: file_name,
      ...createQuestionDto,
    });
    return {
      message: 'Question created successfully',
      question,
    };
  }

  async findAll() {
    return await this.repo.findAll({ include: { all: true } });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        include: { all: true },
        order: [['createdAt', 'DESC']],
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

  async findOne(id: number) {
    const question = await this.repo.findByPk(id);

    if (!question) {
      throw new BadRequestException(`Question with id ${id} not found`);
    }

    return question;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto, file: any) {
    const question = await this.findOne(id);

    if (file) {
      let file_name: string;
      try {
        if (question.file !== null) {
          try {
            await this.fileService.deleteFile(question.file);
          } catch (error) {
            // throw new BadRequestException(error.message);
          }
        }
        file_name = await this.fileService.createFile(file);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      await question.update({
        file: file_name,
        ...updateQuestionDto,
      });
      return {
        message: 'Success',
        question,
      };
    }
    await question.update(updateQuestionDto);
    return {
      message: 'Success',
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
