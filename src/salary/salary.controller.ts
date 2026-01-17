import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  Version,
  Res,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { Response } from 'express';

@ApiTags('Salary')
@Controller('salary')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Version('1')
  @ApiOperation({ summary: 'Salary create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Export excel by salary' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('excel/:school_id')
  async excelSalary(
    @Param('school_id') school_id: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('teacher_id') teacher_id?: string,
    @Res() res?: Response,
  ) {
    return this.salaryService.excelSalary(
      +school_id,
      year ? +year : undefined,
      month ? +month : undefined,
      teacher_id ? +teacher_id : undefined,
      res,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Salary view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.salaryService.findOne(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Salary paginate (universal)' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id')
  paginateSalary(
    @Param('school_id') school_id: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('teacher_id') teacher_id?: string,
    @Query('page') page = '1',
  ) {
    return this.salaryService.paginateSalary({
      school_id: +school_id,
      year: year ? +year : undefined,
      month: month ? +month : undefined,
      teacher_id: teacher_id ? +teacher_id : undefined,
      page: +page,
    });
  }

  @Version('1')
  @ApiOperation({ summary: 'Salary update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.salaryService.update(+id, +school_id, updateSalaryDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Salary remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.salaryService.remove(+id, +school_id);
  }
}
