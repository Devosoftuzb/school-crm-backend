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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Student')
@Controller('student')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOperation({ summary: 'Student create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.studentService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id/find')
  findBySchoolId(@Param('school_id') school_id: string) {
    return this.studentService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Student paginate' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(
    @Query('page') page: number,
    @Param('school_id') school_id: string
  ) {
    return this.studentService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Student view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.studentService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Student update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(+id, +school_id, updateStudentDto);
  }

  @ApiOperation({ summary: 'Student remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(
    @Param('id') id: string, 
    @Param('school_id') school_id: string
  ) {
    return this.studentService.remove(+id, +school_id);
  }
}
