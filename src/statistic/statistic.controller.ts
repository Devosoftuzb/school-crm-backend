import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Version,
} from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Statistic')
@Controller('statistic')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Version('1')
  @ApiOperation({ summary: 'School Statistics' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('school/:school_id')
  getSchoolStatistics(@Param('school_id') school_id: string) {
    return this.statisticService.getSchoolStatistics(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'School Payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('school-payments/:school_id/:year')
  getYearlyPayments(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
  ) {
    return this.statisticService.getYearlyPayments(+school_id, +year);
  }

  @Version('1')
  @ApiOperation({ summary: 'School Student payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('school-studentPayments/:school_id/:month')
  studentPayments(
    @Param('school_id') school_id: string,
    @Param('month') month: string,
  ) {
    return this.statisticService.studentPayments(+school_id, month);
  }

  @Version('1')
  @ApiOperation({ summary: 'Teacher Student payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get('teacher-studentPayments/:school_id/:employee_id/:month')
  getTeacherStudentPayments(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('month') month: string,
  ) {
    return this.statisticService.getTeacherStudentPayments(
      +school_id,
      +employee_id,
      month,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Teacher Salary' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get('teacher-salary/:school_id/:employee_id/:year')
  getTeacherStudentPaymentsByYear(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('year') year: string,
  ) {
    return this.statisticService.getTeacherStudentPaymentsByYear(
      +school_id,
      +employee_id,
      +year,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Teacher stats' })
  @Roles('teacher')
  @Get('teacher-stats/:school_id/:employee_id')
  getEmployeeStats(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
  ) {
    return this.statisticService.getEmployeeStats(+school_id, +employee_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'School Payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('payment-day/:school_id/:date')
  getDayPayments(
    @Param('school_id') school_id: string,
    @Param('date') date: string,
  ) {
    return this.statisticService.getDayPayments(+school_id, date);
  }

  @Version('1')
  @ApiOperation({ summary: 'School Payments' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('payment-day/:school_id/:group_id/:date')
  getDayPaymentsGroup(
    @Param('school_id') school_id: string,
    @Param('group_id') group_id: string,
    @Param('date') date: string,
  ) {
    return this.statisticService.getDayPaymentsGroup(
      +school_id,
      +group_id,
      date,
    );
  }

  @ApiOperation({ summary: 'School Payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get('payment-day-employee/:school_id/:employee_id/:date')
  getEmployeeDayPayments(
    @Param('school_id') school_id: string,
    @Param('employee_id') employee_id: string,
    @Param('date') date: string,
  ) {
    return this.statisticService.getEmployeeDayPayments(
      +school_id,
      +employee_id,
      date,
    );
  }

  @ApiOperation({ summary: 'School Statistics' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('finance/:school_id')
  getFinanceStatistics(@Param('school_id') school_id: string) {
    return this.statisticService.getFinanceStatistics(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'School Customer' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('customer/:school_id/:date')
  getCustomerStatistics(
    @Param('school_id') school_id: string,
    @Param('date') date: string,
  ) {
    return this.statisticService.getCustomerStatistics(+school_id, date);
  }
}
