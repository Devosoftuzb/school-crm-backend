import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TestGroup } from './models/test-group.model';
import { TestGroupDto } from './dto/test-group.dto';
import { Answer } from 'src/answer/models/answer.model';
import { Question } from 'src/question/models/question.model';
import { Subject } from 'src/subject/models/subject.model';
import { TestResult } from 'src/test-result/models/test-result.model';
import { TestTime } from 'src/test-time/models/test-time.model';
import { Student } from 'src/student/models/student.model';
import { TestSubmit } from 'src/test-submit/models/test-submit.model';

@Injectable()
export class TestGroupService {
  constructor(
    @InjectModel(TestGroup) private testGroupRepository: typeof TestGroup,
  ) {}

  async create(testGroupDto: TestGroupDto): Promise<object> {
    try {
      const test_group = await this.testGroupRepository.create(testGroupDto);
      if (!test_group) {
        throw new BadRequestException('Test yaratishda xatolik!');
      }
      return { message: "Test ro'yxatga qo'shildi", id: test_group.id };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<TestGroup[]> {
    try {
      const test_groups = await this.testGroupRepository.findAll({
        include: [
          { model: Subject },
          { model: Question, include: [Answer] },
          { model: TestResult },
          { model: TestSubmit, include: [Student] },
          { model: TestTime },
        ],
      });
      if (!test_groups.length) {
        throw new BadRequestException("Testlar ro'yxati bo'sh!");
      }
      return test_groups;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;
      const staffs = await this.testGroupRepository.findAll({
        include: [
          { model: Subject },
          { model: Question, include: [Answer] },
          { model: TestResult },
          { model: TestSubmit, include: [Student] },
          { model: TestTime },
        ],
        offset,
        limit,
      });
      const total_count = await this.testGroupRepository.count();
      const total_pages = Math.ceil(total_count / limit);
      const res = {
        status: 200,
        data: {
          records: staffs,
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

  async findOne(id: number): Promise<TestGroup> {
    try {
      const test_group = await this.testGroupRepository.findByPk(id, {
        include: [
          { model: Subject },
          { model: Question, include: [Answer] },
          { model: TestResult },
          { model: TestSubmit, include: [Student] },
          { model: TestTime },
        ],
      });
      if (!test_group) {
        throw new BadRequestException('Test topilmadi!');
      }
      return test_group;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, testGroupDto: TestGroupDto): Promise<object> {
    try {
      const test_group = await this.testGroupRepository.findByPk(id);
      if (!test_group) {
        throw new BadRequestException('Test topilmadi!');
      }
      await this.testGroupRepository.update(testGroupDto, {
        where: { id: test_group.id },
        returning: true,
      });
      return { message: 'Test tahrirlandi' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<object> {
    try {
      const test_group = await this.findOne(id);
      test_group.destroy();
      return { message: "Test ro'yxatdan o'chirildi" };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
