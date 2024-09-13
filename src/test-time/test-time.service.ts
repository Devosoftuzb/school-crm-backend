import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TestTime } from './models/test-time.model';
import { TestTimeDto } from './dto/test-time.dto';
import { Op } from 'sequelize';

@Injectable()
export class TestTimeService {
  constructor(
    @InjectModel(TestTime) private testTimeRepository: typeof TestTime,
  ) {}

  async create(testTimeDto: TestTimeDto): Promise<TestTime> {
    try {
      const { student_id, test_group_id } = testTimeDto;
      const exist = await this.testTimeRepository.findOne({
        where: { [Op.and]: [{ student_id }, { test_group_id }] },
      });
      if (exist) {
        return exist;
      } else {
        const test_time = await this.testTimeRepository.create(testTimeDto);
        if (!test_time) {
          throw new BadRequestException('Testga berilgan vaqtda xatolik!');
        }
        return test_time;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<TestTime[]> {
    try {
      const test_times = await this.testTimeRepository.findAll({
        include: { all: true },
      });
      if (!test_times.length) {
        throw new BadRequestException("Test vaqtlari ro'yxati bo'sh!");
      }
      return test_times;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number): Promise<TestTime> {
    try {
      const test_time = await this.testTimeRepository.findOne({
        where: { id },
        include: { all: true },
      });
      if (!test_time) {
        throw new BadRequestException('Test vaqti topilmadi!');
      }
      return test_time;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findById(
    student_id: string,
    test_group_id: number,
  ): Promise<TestTime[]> {
    try {
      const test_times = await this.testTimeRepository.findAll({
        where: { [Op.and]: [{ student_id }, { test_group_id }] },
      });
      if (!test_times.length) {
        throw new BadRequestException('Test vaqti topilmadi!');
      }
      return test_times;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findByStudentId(student_id: string): Promise<TestTime[]> {
    try {
      const test_times = await this.testTimeRepository.findAll({
        where: { student_id },
      });
      if (!test_times.length) {
        throw new BadRequestException('Test vaqti topilmadi!');
      }
      return test_times;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, testTimeDto: TestTimeDto): Promise<TestTime> {
    try {
      const test_time = await this.testTimeRepository.findOne({
        where: { id },
      });
      if (!test_time) {
        throw new BadRequestException('Test vaqti topilmadi!');
      }
      const updated = await this.testTimeRepository.update(testTimeDto, {
        where: { id: test_time.id },
        returning: true,
      });
      return updated[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const test_time = await this.findOne(id);
      test_time.destroy();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
