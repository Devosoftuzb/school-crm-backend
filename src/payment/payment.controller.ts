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
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Response } from 'express';
import { ExcelHistoryDto } from './dto/excel-history.dto';
import { ExcelTeacherHistoryDto } from './dto/excel-teacher-history.dto';

@ApiTags('Payment')
@Controller('payment')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Version('1')
  @ApiOperation({ summary: 'Payment create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Get debtor history' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('history/debtor')
  async getDebtors(
    @Query('school_id') school_id: string,
    @Query('employee_id') employee_id?: string,
    @Query('group_id') group_id?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('page') page?: string,
  ) {
    if (!school_id) throw new BadRequestException('school_id majburiy');
    if (!year) throw new BadRequestException('year majburiy');
    if (!month) throw new BadRequestException('month majburiy');

    const response = await this.paymentService.findDebtors(
      Number(school_id),
      year,
      month,
      {
        employee_id: employee_id ? Number(employee_id) : undefined,
        group_id: group_id ? Number(group_id) : undefined,
        page: page ? Number(page) : 1,
      },
    );

    return response;
  }

  @Version('1')
  @ApiOperation({ summary: 'Export excel by payment' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get('history/all/excel')
  async excelAllHistory(
    @Query('school_id') school_id: number,
    @Res() res: Response,
  ) {
    return this.paymentService.excelAllHistory(school_id, res);
  }

  @Version('1')
  @ApiOperation({ summary: 'Export excel by payment' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get('history/excel')
  async excelHistory(
    @Query('school_id') school_id: number,
    @Query() query: ExcelHistoryDto,
    @Res() res: Response,
  ) {
    const { year, month, day, group_id } = query;

    return this.paymentService.excelHistory(
      school_id,
      year,
      month,
      day,
      group_id,
      res,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Export excel by employee' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get('history/teacher/excel')
  async excelTeacherHistory(
    @Query('school_id') school_id: number,
    @Query() query: ExcelTeacherHistoryDto,
    @Res() res: Response,
  ) {
    const { year, month, day, employee_id } = query;

    return this.paymentService.excelTeacherHistory(
      school_id,
      employee_id,
      year,
      month,
      day,
      res,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Export Excel by debtor' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get('debtor/excel')
  async exportDebtorExcel(
    @Query('school_id') school_id: number,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query() query: ExcelHistoryDto,
    @Res() res: Response,
  ) {
    if (!school_id) throw new BadRequestException('school_id majburiy');
    if (!year) throw new BadRequestException('year majburiy');
    if (!month) throw new BadRequestException('month majburiy');

    const { group_id, employee_id } = query;

    return this.paymentService.exportDebtorExcel(school_id, year, month, res, {
      group_id: group_id ? Number(group_id) : undefined,
      employee_id: employee_id ? Number(employee_id) : undefined,
    });
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.findOne(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(+id, +school_id, updatePaymentDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.remove(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Attendance view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('group/:school_id/:group_id')
  findGroupStudent(
    @Param('school_id') school_id: string,
    @Param('group_id') group_id: string,
  ) {
    return this.paymentService.findGroupStudent(+school_id, +group_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Attendance view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('student/:school_id/:student_id')
  findStudentGroup(
    @Param('school_id') school_id: string,
    @Param('student_id') student_id: string,
  ) {
    return this.paymentService.findStudentGroup(+school_id, +student_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'History view' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('history')
  async findHistory(
    @Query('school_id') school_id: string,
    @Query('employee_id') employee_id?: string,
    @Query('group_id') group_id?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('day') day?: string,
    @Query('status') status?: 'all' | 'payment' | 'halfPayment' | 'discount',
    @Query('page') page?: string,
  ) {
    if (!school_id) throw new BadRequestException('school_id majburiy');

    const response = await this.paymentService.findHistory({
      school_id: Number(school_id),
      employee_id: employee_id ? Number(employee_id) : undefined,
      group_id: group_id ? Number(group_id) : undefined,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      day: day ? Number(day) : undefined,
      status,
      page: page ? Number(page) : 1,
    });

    return response;
  }
}
