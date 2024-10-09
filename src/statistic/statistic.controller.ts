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
  @Get('school-payments/:school_id')
  getSchoolPayments(@Param('school_id') school_id: string) {
    return this.statisticService.getSchoolPayments(+school_id);
  }

  @ApiOperation({ summary: 'Teacher Moneys' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('teacher-moneys/:school_id/:id')
  getTeacherMoneys(
    @Param('school_id') school_id: string,
    @Param('id') id: string,
  ) {
    return this.statisticService.getTeacherMoneys(+school_id, +id);
  }

  @ApiOperation({ summary: 'School Payments' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('payment-day/:school_id')
  getDayPayments(@Param('school_id') school_id: string) {
    return this.statisticService.getDayPayments(+school_id);
  }
}
