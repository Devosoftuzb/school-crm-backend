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
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ResetPasswordDto } from './dto/resertPassword.dto';

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ApiOperation({ summary: 'View all employees by school ID. Web' })
  @Get('/web')
  findAllWeb() {
    return this.employeeService.findAllWeb();
  }

  @Version('1')
  @ApiOperation({ summary: 'Create a new employee' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'View employees by school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAll(@Param('school_id') school_id: string) {
    return this.employeeService.findAll(+school_id);
  }

  @ApiOperation({ summary: 'View employees by school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id/find')
  findBySchoolId(@Param('school_id') school_id: string) {
    return this.employeeService.findBySchoolId(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Paginate employees by school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Get(':school_id/:role/page')
  paginate(
    @Param('school_id') school_id: string,
    @Param('role') role: string,
    @Query('page') page: number,
  ) {
    return this.employeeService.paginate(+school_id, role, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOne(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id/not')
  findOneNot(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOneNot(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id/subject')
  findOneSubject(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
  ) {
    return this.employeeService.findOneSubject(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id/group')
  findOneGroup(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOneGroup(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Get(':school_id/:id/fullname')
  findOneFullName(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
  ) {
    return this.employeeService.findOneFullName(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Update employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(+id, +school_id, updateEmployeeDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Remove employee by ID and school ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.remove(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Change password employee' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Post('change-password/:school_id/:id')
  changePassword(
    @Param('school_id') school_id: string,
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.employeeService.changePassword(
      +school_id,
      +id,
      changePasswordDto,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Reset password employee' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post('reset-password/:school_id/:id')
  resetPassword(
    @Param('school_id') school_id: string,
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.employeeService.resetPassword(
      +school_id,
      +id,
      resetPasswordDto,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Search employee by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search/:school_id/:role/:name')
  searchName(
    @Param('school_id') school_id: string,
    @Param('role') role: string,
    @Param('name') name: string,
  ) {
    return this.employeeService.searchName(+school_id, role, name);
  }
}
