import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerAnswerDto } from './dto/create-customer_answer.dto';
import { UpdateCustomerAnswerDto } from './dto/update-customer_answer.dto';
import { InjectModel } from '@nestjs/sequelize';
import { CustomerAnswer } from './model/customer_answer.model';
import { Option } from 'src/option/model/option.model';
import { CustomerTest } from 'src/customer_test/model/customer_test.model';

@Injectable()
export class CustomerAnswerService {
  constructor(
    @InjectModel(CustomerAnswer) private repo: typeof CustomerAnswer,
    @InjectModel(Option) private repoOption: typeof Option,
    @InjectModel(CustomerTest) private repoCustomerTest: typeof CustomerTest,
  ) {}

  async create(createCustomerAnswerDto: CreateCustomerAnswerDto) {
    const createdAnswers = []; 
    let score = 0; 
    let customerTestId: number | null = null; 

    for (const answer of createCustomerAnswerDto.list) {
      const { customer_test_id, question_id, option_id } = answer;

      
      const option = await this.repoOption.findOne({
        where: { id: option_id, question_id: question_id },
      });

      if (!option) {
        throw new Error('Savol uchun mos variant topilmadi');
      }

      const is_correct = option.is_correct; 

      if (is_correct) {
        score += 1; 
      }

   
      const customerAnswer = await this.repo.create({
        customer_test_id,
        question_id,
        option_id,
        is_correct,
      });

      customerTestId = customer_test_id; 
      createdAnswers.push(customerAnswer); 
    }

  
    let result = '';
    if (score <= 12) {
      result = 'BEGINNER'; 
    } else if (score <= 20) {
      result = 'ELEMENTARY'; 
    } else if (score <= 31) {
      result = 'PRE INTER'; 
    } else if (score <= 45) {
      result = 'INTER'; 
    } else {
      result = 'IELTS'; 
    }

    if (customerTestId !== null) {
      await this.repoCustomerTest.update(
        { result }, 
        { where: { id: customerTestId } }, 
      );
    }

    return {
      message: 'Customer Answers created successfully',
      customerAnswers: createdAnswers,
      score,
      result,
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
    const customer_answer = await this.repo.findByPk(id, {
      include: { all: true },
    });

    if (!customer_answer) {
      throw new BadRequestException(`Customer with id ${id} not found`);
    }

    return customer_answer;
  }

  async remove(id: number) {
    const customer_answer = await this.findOne(id);
    await customer_answer.destroy();

    return {
      message: 'Customer Answer removed successfully',
    };
  }
}
