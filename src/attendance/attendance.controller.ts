import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Version,
  Res,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Version('1')
  @ApiOperation({ summary: 'Attendance create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  saveAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.saveAttendance(createAttendanceDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Attendance group history view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:group_id/:year/:month/page')
  findGroupHistory(
    @Param('school_id') school_id: string,
    @Param('group_id') group_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('page') page: number,
  ) {
    return this.attendanceService.findGroupHistory(
      +school_id,
      +group_id,
      +year,
      month === 'all' ? null : +month,
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
    return this.attendanceService.findGroupStudent(+school_id, +group_id);
  }

  @Get('excel')
  @Version('1')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  async excelAttendance(
    @Query('school_id') school_id: number,
    @Query('group_id') group_id: number,
    @Query('year') year: number,
    @Query('month') month?: string, 
    @Res() res?: Response,
  ) {
    return this.attendanceService.excelAttendanceHistory(
      +school_id,
      +group_id,
      +year,
      month && month !== 'all' ? +month : undefined, 
      res,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Attendance remove by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':school_id/:group_id/:student_id')
  remove(
    @Param('group_id') group_id: string,
    @Param('student_id') student_id: string,
    @Param('school_id') school_id: string,
  ) {
    return this.attendanceService.remove(+group_id, +student_id, +school_id);
  }
}
