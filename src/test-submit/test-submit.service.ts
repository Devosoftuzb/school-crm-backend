import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TestSubmit } from './models/test-submit.model';
import { TestSubmitDto } from './dto/test-submit.dto';
import { Op } from 'sequelize';

@Injectable()
export class TestSubmitService {
  constructor(
    @InjectModel(TestSubmit) private testSubmitRepository: typeof TestSubmit,
  ) {}

  async create(testSubmitDto: TestSubmitDto): Promise<TestSubmit> {
    try {
      const { student_id, test_group_id } = testSubmitDto;
      const exist = await this.testSubmitRepository.findOne({
        where: { [Op.and]: [{ student_id }, { test_group_id }] },
      });
      if (exist) {
        await this.testSubmitRepository.destroy({ where: { id: exist.id } });
      }
      const test_time = await this.testSubmitRepository.create(testSubmitDto);
      if (!test_time) {
        throw new BadRequestException('Testni topshirishda xatolik!');
      }
      return test_time;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<TestSubmit[]> {
    try {
      const test_submits = await this.testSubmitRepository.findAll({
        include: { all: true },
      });
      if (!test_submits.length) {
        throw new BadRequestException("Test topshiriqlari ro'yxati bo'sh!");
      }
      return test_submits;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number): Promise<TestSubmit> {
    try {
      const test_submit = await this.testSubmitRepository.findOne({
        where: { id },
        include: { all: true },
      });
      if (!test_submit) {
        throw new BadRequestException("Test topshirig'i topilmadi!");
      }
      return test_submit;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findById(
    student_id: string,
    test_group_id: number,
  ): Promise<TestSubmit[]> {
    try {
      const test_submits = await this.testSubmitRepository.findAll({
        where: { [Op.and]: [{ student_id }, { test_group_id }] },
      });
      if (!test_submits.length) {
        throw new BadRequestException('Talabaning topshiriqlari topilmadi!');
      }
      return test_submits;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findByStudentId(student_id: string): Promise<TestSubmit[]> {
    try {
      const test_submits = await this.testSubmitRepository.findAll({
        where: { student_id },
      });
      if (!test_submits.length) {
        throw new BadRequestException('Talabaning topshiriqlari topilmadi!');
      }
      return test_submits;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, testSubmitDto: TestSubmitDto): Promise<TestSubmit> {
    try {
      const test_submit = await this.testSubmitRepository.findByPk(id);
      if (!test_submit) {
        throw new BadRequestException("Test topshirig'i topilmadi!");
      }
      const updated_test_submit = await this.testSubmitRepository.update(
        testSubmitDto,
        { where: { id }, returning: true },
      );
      return updated_test_submit[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const test_submit = await this.testSubmitRepository.findByPk(id);
      if (!test_submit) {
        throw new BadRequestException("Test topshirig'i topilmadi!");
      }
      await this.testSubmitRepository.destroy({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
