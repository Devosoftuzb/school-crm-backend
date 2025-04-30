import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Question } from './model/question.model';
import { FilesService } from 'src/common/files/files.service';
import { Option } from 'src/option/model/option.model';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question) private repo: typeof Question,
    private readonly fileService: FilesService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto, file: any) {
    let file_name: string;
    if (file) {
      file_name = await this.fileService.createFile(file);
    }
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
    return await this.repo.findAll({
      include: [
        {
          all: true,
          nested: true,
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Option, as: 'option' }, 'createdAt', 'ASC'],
      ],
    });
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
    const question = await this.repo.findByPk(id, {
      include: [
        {
          model: Option,
          as: 'option',
          separate: true, // alohida query ishlatadi va 'order' ishlaydi
          order: [['createdAt', 'ASC']], // optionlar bo‘yicha tartib
        },
        // boshqa include lar ham shu yerda bo'lishi mumkin
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
