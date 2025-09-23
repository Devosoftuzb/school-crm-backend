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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Payment')
@Controller('payment')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Payment create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @ApiOperation({ summary: 'Payment view all by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @ApiOperation({ summary: 'Payment view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.paymentService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Payment view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Payment history month view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
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

  @ApiOperation({
    summary: 'Payment debtor month group view by ID by school ID',
  })
  @Roles('owner', 'administrator')
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

  @ApiOperation({ summary: 'Payment remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.remove(+id, +school_id);
  }

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
}
