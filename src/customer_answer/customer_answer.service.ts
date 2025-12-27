import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerAnswerDto } from './dto/create-customer_answer.dto';
import { InjectModel } from '@nestjs/sequelize';
import { CustomerAnswer } from './model/customer_answer.model';
import { Option } from 'src/option/model/option.model';
import { CustomerTest } from 'src/customer_test/model/customer_test.model';
import { Question } from 'src/questions/model/question.model';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Google AI import
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomerAnswerService {
  private genAI: GoogleGenerativeAI;
  private geminiModel: any;

  constructor(
    @InjectModel(CustomerAnswer) private repo: typeof CustomerAnswer,
    @InjectModel(Option) private repoOption: typeof Option,
    @InjectModel(CustomerTest) private repoCustomerTest: typeof CustomerTest,
    @InjectModel(Question) private repoQuestion: typeof Question,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY topilmadi! .env faylini tekshiring.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.geminiModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0 },
    });
  }

  async create(createCustomerAnswerDto: CreateCustomerAnswerDto) {
    const createdAnswers = [];
    let score = 0;
    let customerTestId: number | null = null;
    let writingResult = "Noma'lum";

    for (const answer of createCustomerAnswerDto.list) {
      const { customer_test_id, question_id, option_id, writing } = answer;

      const question = await this.repoQuestion.findByPk(question_id);
      if (!question) throw new BadRequestException('Savol topilmadi');

      let customerAnswer;

      if (question.type === 'writing') {
        if (!writing)
          throw new BadRequestException('Writing javob kiritilmagan');

        const writingLevel = await this.checkWritingLevel(writing);

        customerAnswer = await this.repo.create({
          customer_test_id,
          question_id,
          writing,
        });

        writingResult = writingLevel;
      } else {
        const option = await this.repoOption.findOne({
          where: { id: option_id, question_id },
        });

        if (!option)
          throw new BadRequestException('Savol uchun mos variant topilmadi');

        const is_correct = option.is_correct;
        if (is_correct) score += 1;

        customerAnswer = await this.repo.create({
          customer_test_id,
          question_id,
          option_id,
          is_correct,
        });
      }

      customerTestId = customer_test_id;
      createdAnswers.push(customerAnswer);
    }

    let testResult = '';
    if (score <= 15) testResult = 'BEGINNER';
    else if (score <= 27) testResult = 'ELEMENTARY';
    else if (score <= 38) testResult = 'PRE INTERMEDIATE';
    else if (score <= 50) testResult = 'INTERMEDIATE';
    else if (score <= 70) testResult = 'IELTS';
    else testResult = "Noma'lum";

    const overall = this.calculateOverallResult(testResult, writingResult);

    if (customerTestId !== null) {
      await this.repoCustomerTest.update(
        {
          test_result: testResult,
          writing_result: writingResult,
          overall_result: overall,
        },
        { where: { id: customerTestId } },
      );
    }

    return {
      message: 'Customer Answers created successfully',
      customerAnswers: createdAnswers,
      score,
      test_result: testResult,
      writing_result: writingResult,
      overall_result: overall,
    };
  }

  private async checkWritingLevel(writing: string): Promise<string> {
    try {
      const prompt = `
        As an English teacher, evaluate the following writing and categorize it into one of these levels:
        BEGINNER, ELEMENTARY, PRE INTERMEDIATE, INTERMEDIATE, IELTS.

        Writing: """${writing}"""

        Strictly return ONLY ONE WORD from the list above. No explanations or extra text.
      `;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const level = response.text().trim().toUpperCase();

      // Kutilgan darajalardan biri ekanligini tekshirish (fallback)
      const allowedLevels = [
        'BEGINNER',
        'ELEMENTARY',
        'PRE INTERMEDIATE',
        'INTERMEDIATE',
        'IELTS',
      ];
      const finalLevel = allowedLevels.find((l) => level.includes(l));

      return finalLevel || "Noma'lum";
    } catch (err) {
      console.error('Gemini API error:', err);
      return "Noma'lum";
    }
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
      return {
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    const customer_answer = await this.repo.findByPk(id, {
      include: { all: true },
    });
    if (!customer_answer) {
      throw new BadRequestException(`Customer answer with id ${id} not found`);
    }
    return customer_answer;
  }

  async remove(id: number) {
    const customer_answer = await this.findOne(id);
    await customer_answer.destroy();
    return { message: 'Customer Answer removed successfully' };
  }

  private calculateOverallResult(
    testResult: string,
    writingResult: string,
  ): string {
    const levels: Record<string, number> = {
      BEGINNER: 1,
      ELEMENTARY: 2,
      'PRE INTERMEDIATE': 3,
      INTERMEDIATE: 4,
      IELTS: 5,
    };

    const reverseLevels: Record<number, string> = {
      1: 'BEGINNER',
      2: 'ELEMENTARY',
      3: 'PRE INTERMEDIATE',
      4: 'INTERMEDIATE',
      5: 'IELTS',
    };

    const testScore = levels[testResult] || 0;
    const writingScore = levels[writingResult] || 0;

    const average = Math.round((testScore + writingScore) / 2);

    return reverseLevels[average] || "Noma'lum";
  }
}
