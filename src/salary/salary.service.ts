import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Salary } from './models/salary.model';
import { Op } from 'sequelize';
import { Employee } from 'src/employee/models/employee.model';
import * as XLSX from 'xlsx';
import { Response } from 'express';

@Injectable()
export class SalaryService {
  constructor(@InjectModel(Salary) private repo: typeof Salary) {}

  async create(createSalaryDto: CreateSalaryDto) {
    const salary = await this.repo.create(createSalaryDto);
    return {
      message: 'Salary created successfully',
      salary,
    };
  }

  async paginateSalary(params: {
    school_id: number;
    page: number;
    year?: number;
    month?: number;
    teacher_id?: number;
  }): Promise<object> {
    try {
      const { school_id, page, year, month, teacher_id } = params;

      let currentPage = Number(page) || 1;
      if (currentPage < 1) currentPage = 1;

      const limit = 15;
      const offset = (currentPage - 1) * limit;

      const whereCondition: any = { school_id };

      if (teacher_id) {
        whereCondition.teacher_id = teacher_id;
      }

      if (year && month) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1),
        };
      } else if (year) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1),
        };
      }

      const records = await this.repo.findAll({
        where: whereCondition,
        attributes: [
          'id',
          'price',
          'method',
          'month',
          'description',
          'createdAt',
        ],
        include: [{ model: Employee, attributes: ['full_name'] }],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const total_count = await this.repo.count({
        where: whereCondition,
      });

      return {
        status: 200,
        data: {
          records,
          pagination: {
            currentPage,
            total_pages: Math.ceil(total_count / limit),
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number, school_id: number) {
    const salary = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
    });

    if (!salary) {
      throw new BadRequestException(`Salary with id ${id} not found`);
    }

    return salary;
  }

  async update(
    id: number,
    school_id: number,
    updateSalaryDto: UpdateSalaryDto,
  ) {
    const salary = await this.findOne(id, school_id);
    await salary.update(updateSalaryDto);

    return {
      message: 'Salary updated successfully',
      salary,
    };
  }

  async remove(id: number, school_id: number) {
    const salary = await this.findOne(id, school_id);
    await salary.destroy();

    return {
      message: 'Salary removed successfully',
    };
  }

  async excelSalary(
    school_id: number,
    year?: number,
    month?: number,
    teacher_id?: number,
    res?: Response,
  ) {
    try {
      const whereCondition: any = { school_id };

      if (teacher_id) {
        whereCondition.teacher_id = teacher_id;
      }

      if (year && month) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1),
        };
      } else if (year) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1),
        };
      } else {
        throw new BadRequestException('Kamida year berilishi kerak');
      }

      const rawData = await this.repo.findAll({
        where: whereCondition,
        attributes: [
          'id',
          'price',
          'method',
          'month',
          'description',
          'createdAt',
        ],
        include: [{ model: Employee, attributes: ['full_name'] }],
        order: [['createdAt', 'DESC']],
      });

      if (!rawData.length) {
        throw new BadRequestException("Ma'lumot topilmadi");
      }

      const dataToExport = rawData.map((item) => ({
        'O‘qituvchi (F.I.O)': item.teacher?.full_name || 'Nomaʼlum',
        Suma: Number(item.price).toLocaleString('uz-UZ'),
        'To‘lov turi': item.method,
        Oy: this.monthNames(Number(item.month)),
        Izoh: item.description || '',
        'To‘lov sanasi': this.formatDate(item.createdAt),
      }));

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      const worksheet = this.createWorksheet(dataToExport);

      worksheet['!cols'] = [
        { wch: 25 }, // O‘qituvchi
        { wch: 15 }, // Suma
        { wch: 15 }, // To‘lov turi
        { wch: 12 }, // Oy
        { wch: 30 }, // Izoh
        { wch: 18 }, // To‘lov sanasi
      ];

      let sheetName = 'Salary';
      if (year && month) {
        sheetName = `${this.monthNames(month)} ${year}`;
      } else if (year) {
        sheetName = `${year} yil`;
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer: Buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      }) as Buffer;

      let fileName = 'salary_history.xlsx';
      if (teacher_id) {
        fileName = `salary_teacher_${teacher_id}_${month || ''}_${year}.xlsx`;
      } else if (year && month) {
        fileName = `salary_${month}_${year}.xlsx`;
      } else if (year) {
        fileName = `salary_${year}.xlsx`;
      }

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      return res.send(excelBuffer);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        error.message || 'Excel yaratishda xatolik yuz berdi',
      );
    }
  }

  private createWorksheet<T extends object>(data: T[]): XLSX.WorkSheet {
    return XLSX.utils.json_to_sheet(data as unknown as object[]);
  }

  private monthNames = (monthNum: number): string => {
    const months = [
      'Yanvar',
      'Fevral',
      'Mart',
      'Aprel',
      'May',
      'Iyun',
      'Iyul',
      'Avgust',
      'Sentabr',
      'Oktabr',
      'Noyabr',
      'Dekabr',
    ];
    return months[monthNum - 1] || '';
  };

  private formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };
}
