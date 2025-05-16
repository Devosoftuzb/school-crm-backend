import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Test } from './model/test.model';
import { Subject } from 'src/subject/models/subject.model';
import { Question } from 'src/questions/model/question.model';
import { Option } from 'src/option/model/option.model';

@Injectable()
export class TestService {
  constructor(@InjectModel(Test) private repo: typeof Test) {}

  async create(createTestDto: CreateTestDto) {
    const test = await this.repo.create(createTestDto);
    return {
      message: 'Test created successfully',
      test,
    };
  }

  async findAll() {
    return await this.repo.findAll({
      include: [{ model: Subject, attributes: ['name'] }],
    });
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        include: [{ model: Subject, attributes: ['name'] }],
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
    const test = await this.repo.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
          separate: true,
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: Option,
              as: 'option', 
            },
          ],
        },
      ],
    });

    if (!test) {
      throw new BadRequestException(`Test with id ${id} not found`);
    }

    return test;
  }

  async update(id: number, updateTestDto: UpdateTestDto) {
    const test = await this.findOne(id);
    await test.update(updateTestDto);

    return {
      message: 'Test updated successfully',
      test,
    };
  }

  async remove(id: number) {
    const test = await this.findOne(id);
    await test.destroy();

    return {
      message: 'Test removed successfully',
    };
  }
}
