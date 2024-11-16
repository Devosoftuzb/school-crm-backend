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
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';

@ApiTags('Employee')
@Controller('employee')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ApiOperation({ summary: 'Create a new employee' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @ApiOperation({ summary: 'View all employees by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @ApiOperation({ summary: 'View employees by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.employeeService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'View employees by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id/find')
  findBySchoolId(@Param('school_id') school_id: string) {
    return this.employeeService.findBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Paginate employees by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.employeeService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id/not')
  findOneNot(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOneNot(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id/subject')
  findOneSubject(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOneSubject(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id/group')
  findOneGroup(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOneGroup(+id, +school_id);
  }

  @ApiOperation({ summary: 'View employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id/fullname')
  findOneFullName(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOneFullName(+id, +school_id);
  }

  @ApiOperation({ summary: 'Update employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(+id, +school_id, updateEmployeeDto);
  }

  @ApiOperation({ summary: 'Remove employee by ID and school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.remove(+id, +school_id);
  }

  @ApiOperation({ summary: 'Change password employee' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
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
}
