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
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ArchiveStudentDto } from './dto/archive-student.dto';

@ApiTags('Student')
@Controller('student')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Version('1')
  @ApiOperation({ summary: 'Student create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get(':school_id')
  findAll(@Param('school_id') school_id: string) {
    return this.studentService.findAll(+school_id);
  }

  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get(':school_id/find')
  findBySchoolId(@Param('school_id') school_id: string) {
    return this.studentService.findBySchoolId(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get(':school_id/search')
  findBySchoolIdNot(@Param('school_id') school_id: string) {
    return this.studentService.findBySchoolIdNot(+school_id);
  }

  @ApiOperation({ summary: 'Student view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get(':school_id/:teacher_id/teacher-student')
  findByTeacherId(
    @Param('school_id') school_id: string,
    @Param('teacher_id') teacher_id: string,
  ) {
    return this.studentService.findByTeacherId(+school_id, +teacher_id);
  }

  @ApiOperation({ summary: 'Student archive view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get(':school_id/archive-find')
  findByArchiveSchoolId(@Param('school_id') school_id: string) {
    return this.studentService.findByArchiveSchoolId(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student paginate archive' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('archive/:school_id/page')
  paginateArchive(
    @Query('page') page: number,
    @Param('school_id') school_id: string,
  ) {
    return this.studentService.paginateArchive(+school_id, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student paginate' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.studentService.paginate(+school_id, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student paginate on teacher' })
  @Roles('teacher')
  @Get('teacher/:school_id/:teacher_id/page')
  paginateTeacher(
    @Query('page') page: number,
    @Param('school_id') school_id: string,
    @Param('teacher_id') teacher_id: string,
  ) {
    return this.studentService.paginateTeacher(+school_id, +teacher_id, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.studentService.findOne(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student view by ID by school ID not' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('not/:school_id/:id')
  findOneNot(@Param('school_id') school_id: string, @Param('id') id: string) {
    return this.studentService.findOneNot(+school_id, +id);
  }

  @ApiOperation({ summary: 'Student view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id/payment')
  findOnePayment(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
  ) {
    return this.studentService.findOnePayment(+id, +school_id);
  }

  @ApiOperation({ summary: 'Student view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id/group')
  findOnePaymentGroup(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
  ) {
    return this.studentService.findOnePaymentGroup(+id, +school_id);
  }

  @ApiOperation({ summary: 'Student view by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id/studentGroup')
  findOneGroup(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.studentService.findOneGroup(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student update by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(+id, +school_id, updateStudentDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student archive by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Put('archive/:school_id/:id')
  archive(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() archiveStudentDto: ArchiveStudentDto,
  ) {
    return this.studentService.archive(+id, +school_id, archiveStudentDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student remove by ID by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.studentService.remove(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Search student by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search/:school_id/:name')
  searchName(
    @Param('school_id') school_id: string,
    @Param('name') name: string,
  ) {
    return this.studentService.searchName(+school_id, name);
  }

  @Version('1')
  @ApiOperation({ summary: 'Search student by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search-teacher/:school_id/:teacher_id/:name')
  searchNameTeacher(
    @Param('school_id') school_id: string,
    @Param('teacher_id') teacher_id: string,
    @Param('name') name: string,
  ) {
    return this.studentService.searchNameTeacher(+school_id, +teacher_id, name);
  }

  @Version('1')
  @ApiOperation({ summary: 'Search student by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search-archive/:school_id/:name')
  searchNameArchive(
    @Param('school_id') school_id: string,
    @Param('name') name: string,
  ) {
    return this.studentService.searchNameArchive(+school_id, name);
  }
}
