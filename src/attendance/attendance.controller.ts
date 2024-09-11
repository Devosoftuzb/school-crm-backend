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
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiOperation({ summary: 'Attendance create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @ApiOperation({ summary: 'Attendance view all by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @ApiOperation({ summary: 'Attendance view all by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id')
  findAllByAttendanceId(@Param('school_id') school_id: string) {
    return this.attendanceService.findAllByAttendanceId(+school_id);
  }

  @ApiOperation({ summary: 'Attendance paginate' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.attendanceService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Attendance view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.attendanceService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Attendance update by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(+id, +school_id, updateAttendanceDto);
  }

  @ApiOperation({ summary: 'Attendance remove by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.attendanceService.remove(+id, +school_id);
  }
}
