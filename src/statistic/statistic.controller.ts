import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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

  @ApiOperation({ summary: 'School Statistics' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('school/:school_id')
  getSchoolStatistics(@Param('school_id') school_id: string) {
    return this.statisticService.getSchoolStatistics(+school_id);
  }

  @ApiOperation({ summary: 'School Payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('school-payments/:school_id/:year')
  getYearlyPayments(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
  ) {
    return this.statisticService.getYearlyPayments(+school_id, +year);
  }

  @ApiOperation({ summary: 'School Student payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('school-studentPayments/:school_id/:month')
  studentPayments(
    @Param('school_id') school_id: string,
    @Param('month') month: string,
  ) {
    return this.statisticService.studentPayments(+school_id, month);
  }

  @ApiOperation({ summary: 'Teacher Student payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
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

  @ApiOperation({ summary: 'Teacher Salary' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('teacher-salary/:school_id/:id/:year')
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

  @ApiOperation({ summary: 'School Payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('payment-day/:school_id/:date')
  getDayPayments(
    @Param('school_id') school_id: string,
    @Param('date') date: string,
  ) {
    return this.statisticService.getDayPayments(+school_id, date);
  }
}
