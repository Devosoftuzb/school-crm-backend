import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerTestDto } from './dto/create-customer_test.dto';
import { UpdateCustomerTestDto } from './dto/update-customer_test.dto';
import { InjectModel } from '@nestjs/sequelize';
import { CustomerTest } from './model/customer_test.model';
import { Question } from 'src/questions/model/question.model';
import { Option } from 'src/option/model/option.model';
import { CustomerAnswer } from 'src/customer_answer/model/customer_answer.model';
import { Customer } from 'src/customer/models/customer.model';
import { Test } from 'src/test/model/test.model';
import { QuestionText } from 'src/question-text/model/question-text.model';
import { Subject } from 'src/subject/models/subject.model';
import { Op } from 'sequelize';

@Injectable()
export class CustomerTestService {
  constructor(@InjectModel(CustomerTest) private repo: typeof CustomerTest) {}

  async create(createCustomerTestDto: CreateCustomerTestDto) {
    const customer_test = await this.repo.create(createCustomerTestDto);
    return {
      message: 'Customer Test created successfully',
      customer_test,
    };
  }

  async paginate(school_id: number, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 15;
      const offset = (page - 1) * limit;
      const user = await this.repo.findAll({
        where: { school_id },
        attributes: ['id', 'description', 'overall_result'],
        include: [
          {
            model: Customer,
            attributes: [
              'full_name',
              'phone_number',
              'is_student',
              'description',
            ],
          },
          {
            model: Test,
            attributes: ['id'],
            include: [{ model: Subject, attributes: ['name'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });
      const total_count = await this.repo.count({ where: { school_id } });
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
    const customer_test = await this.repo.findByPk(id, {
      attributes: ['id', 'started_at', 'finished_at', 'test_result', 'writing_result', 'overall_result'],
      include: [
        {
          model: Customer,
          attributes: ['id', 'full_name', 'phone_number', 'description'],
        },
        {
          model: Test,
          attributes: ['count', 'time'],
          include: [{ model: Subject, attributes: ['name'] }],
        },
        {
          model: CustomerAnswer,
          attributes: ['id', 'is_correct'],
          separate: true,
          order: [['id', 'ASC']],
          include: [
            {
              model: Question,
              attributes: ['question', 'file'],
              include: [{ model: QuestionText, attributes: ['title', 'text'] }],
            },
            { model: Option, attributes: ['option', 'is_correct'] },
          ],
        },
      ],
    });

    if (!customer_test) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    return customer_test;
  }

  async findNote(id: number) {
    const customer_test = await this.repo.findByPk(id, {
      attributes: ['description'],
    });

    if (!customer_test) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    return customer_test;
  }

  async update(id: number, updateCustomerTestDto: UpdateCustomerTestDto) {
    const customer_test = await this.findOne(id);
    await customer_test.update(updateCustomerTestDto);

    return {
      message: 'Customer Test updated successfully',
      customer_test,
    };
  }

  async remove(id: number) {
    const customer_test = await this.findOne(id);
    await customer_test.destroy();

    return {
      message: 'Customer Test removed successfully',
    };
  }

  async searchName(school_id: number, name: string) {
    return await this.repo.findAll({
      where: { school_id },
      attributes: ['id', 'description', 'result'],
      include: [
        {
          model: Customer,
          where: { full_name: { [Op.iLike]: `%${name}%` } },
          attributes: [
            'full_name',
            'phone_number',
            'is_student',
            'description',
          ],
        },
        {
          model: Test,
          attributes: ['id'],
          include: [{ model: Subject, attributes: ['name'] }],
        },
      ],
    });
  }
}
