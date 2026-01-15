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

  @ApiOperation({ summary: 'Payment view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.paymentService.findAllBySchoolId(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Export excel by payment' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
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
  @UseGuards(RolesGuard, JwtAuthGuard)
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
  @ApiOperation({ summary: 'Export excel by debtor' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('debtor/excel')
  async exportDebtorExcel(
    @Query('school_id') school_id: number,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query() query: ExcelHistoryDto,
    @Res() res: Response,
  ) {
    const { group_id } = query;

    return this.paymentService.exportDebtorExcel(
      school_id,
      year,
      month,
      res,
      group_id
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.findOne(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment history month view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get('year/:school_id/:year/:status/page')
  findYearHistory(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('status') status: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findYearHistory(+school_id, +year, status, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment history month view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get('month/:school_id/:year/:month/:status/page')
  findMonthHistory(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('status') status: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findMonthHistory(
      +school_id,
      +year,
      +month,
      status,
      page,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment history month view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('groupMonth/:school_id/:group_id/:year/:month/:status/page')
  findGroupMonthHistory(
    @Param('school_id') school_id: string,
    @Param('group_id') group_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('status') status: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findGroupMonthHistory(
      +school_id,
      +group_id,
      year,
      month,
      status,
      page,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment history one day view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get('day/:school_id/:year/:month/:day/:status/page')
  findDayHistory(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
    @Param('status') status: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findDayHistory(
      +school_id,
      +year,
      +month,
      +day,
      status,
      page,
    );
  }

  @Version('1')
  @ApiOperation({
    summary: 'Payment debtor month group view by ID by school ID',
  })
  @Roles('owner', 'administrator', 'teacher')
  @Get('debtor-group/:school_id/:group_id/:year/:month/page')
  findGroupHistoryDebtor(
    @Param('school_id') school_id: string,
    @Param('group_id') group_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findGroupHistoryDebtor(
      +school_id,
      +group_id,
      year,
      month,
      page,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment debtor month view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get('debtor/:school_id/:year/:month/page')
  findHistoryDebtor(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findHistoryDebtor(+school_id, year, month, page);
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
  @ApiOperation({ summary: 'Payment history one day view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('employeeDay/:school_id/:employee_id/:year/:month/:day/page')
  findEmployeeDayHistory(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findEmployeeDayHistory(
      +school_id,
      +employee_id,
      +year,
      +month,
      +day,
      page,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment history month view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('employeeMonth/:school_id/:employee_id/:year/:month/page')
  findEmployeeMonthHistory(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findEmployeeMonthHistory(
      +school_id,
      +employee_id,
      +year,
      +month,
      page,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Payment history month view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('employeeYear/:school_id/:employee_id/:year/page')
  findEmployeeYearHistory(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('year') year: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findEmployeeYearHistory(
      +school_id,
      +employee_id,
      +year,
      page,
    );
  }

  @Version('1')
  @ApiOperation({
    summary: 'Payment debtor month view by school ID and employee ID',
  })
  @Roles('owner', 'administrator', 'teacher')
  @Get('employee-debtor/:school_id/:employee_id/:year/:month/page')
  findEmployeeHistoryDebtor(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('page') page: number,
  ) {
    return this.paymentService.findEmployeeHistoryDebtor(
      +school_id,
      +employee_id,
      year,
      month,
      page,
    );
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
}
