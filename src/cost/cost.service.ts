import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Cost } from './model/cost.model';
import { Op } from 'sequelize';
import { CostCategory } from 'src/cost-category/models/cost-category.model';
import * as XLSX from 'xlsx';
import { Response } from 'express';

@Injectable()
export class CostService {
  constructor(@InjectModel(Cost) private repo: typeof Cost) {}

  async create(createCostDto: CreateCostDto) {
    const cost = await this.repo.create(createCostDto);
    return {
      message: 'Cost created successfully',
      cost,
    };
  }

  async paginateUniversal(params: {
    school_id: number;
    page: number;
    year?: number;
    month?: number;
    category_id?: number;
  }): Promise<object> {
    try {
      const { school_id, page, year, month, category_id } = params;

      const limit = 15;
      const currentPage = Number(page) || 1;
      const offset = (currentPage - 1) * limit;

      const whereCondition: any = { school_id };

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

      if (category_id) {
        whereCondition.category_id = category_id;
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
        include: [{ model: CostCategory, attributes: ['name'] }],
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
    const cost = await this.repo.findOne({
      where: {
        id,
        school_id,
      },
    });

    if (!cost) {
      throw new BadRequestException(`Cost with id ${id} not found`);
    }

    return cost;
  }

  async update(id: number, school_id: number, updateCostDto: UpdateCostDto) {
    const cost = await this.findOne(id, school_id);
    await cost.update(updateCostDto);

    return {
      message: 'Cost updated successfully',
      cost,
    };
  }

  async remove(id: number, school_id: number) {
    const cost = await this.findOne(id, school_id);
    await cost.destroy();

    return {
      message: 'Cost removed successfully',
    };
  }

  async excelCostHistory(
    school_id: number,
    year?: number,
    month?: number,
    category_id?: number,
    res?: Response,
  ) {
    try {
      const whereCondition: any = { school_id };

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

      if (category_id) {
        whereCondition.category_id = category_id;
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
        include: [{ model: CostCategory, attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
      });

      if (!rawData.length) {
        throw new BadRequestException("Ma'lumot topilmadi");
      }

      const dataToExport = rawData.map((item) => ({
        Kategoriya: item.costCategory?.name || 'Nomaʼlum',
        Suma: Number(item.price).toLocaleString('uz-UZ'),
        "To'lov turi": item.method,
        Oy: this.monthNames(Number(item.month)),
        Izoh: item.description || '',
        "To'lov sanasi": this.formatDate(item.createdAt),
      }));

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      const worksheet = this.createWorksheet(dataToExport);

      worksheet['!cols'] = [
        { wch: 20 }, // Kategoriya
        { wch: 15 }, // Suma
        { wch: 15 }, // To'lov turi
        { wch: 12 }, // Oy
        { wch: 30 }, // Izoh
        { wch: 18 }, // To'lov sanasi
      ];

      let sheetName = 'Xarajatlar';
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

      let fileName = 'cost_history.xlsx';
      if (category_id) {
        fileName = `cost_category_${category_id}_${month || ''}_${year}.xlsx`;
      } else if (year && month) {
        fileName = `cost_${month}_${year}.xlsx`;
      } else if (year) {
        fileName = `cost_${year}.xlsx`;
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
