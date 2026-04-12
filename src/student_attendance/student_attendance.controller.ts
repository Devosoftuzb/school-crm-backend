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
  Query,
  Res,
} from '@nestjs/common';
import { StudentAttendanceService } from './student_attendance.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Student Attendance')
@ApiBearerAuth('access-token')
@Roles('owner', 'administrator')
@UseGuards(RolesGuard, JwtAuthGuard)
@Controller('student-attendance')
export class StudentAttendanceController {
  constructor(
    private readonly studentAttendanceService: StudentAttendanceService,
  ) {}

  @ApiOperation({ summary: 'Create attendance' })
  @Post('create/:school_id/:student_id')
  create(
    @Query('school_id') school_id: number,
    @Query('student_id') student_id: number,
  ) {
    return this.studentAttendanceService.create(school_id, student_id);
  }

  @ApiOperation({ summary: 'Attendance view all by school ID and student ID' })
  @Get('all')
  findAll(
    @Query('school_id') school_id: number,
    @Query('student_id') student_id: number,
  ) {
    return this.studentAttendanceService.findAll(school_id, student_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Attendance paginate by school ID and student ID' })
  @Get('page')
  paginate(
    @Query('school_id') school_id: number,
    @Query('student_id') student_id: number,
    @Query('page') page: number,
  ) {
    return this.studentAttendanceService.paginate(school_id, student_id, page);
  }

  @ApiOperation({ summary: 'Download attendance excel by student' })
  @Get('excel')
  excelAttendance(
    @Query('school_id') school_id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    return this.studentAttendanceService.excelAttendance(
      school_id,
      startDate,
      endDate,
      res,
    );
  }
}
