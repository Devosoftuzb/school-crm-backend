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

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ApiOperation({ summary: 'Employee create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @ApiOperation({ summary: 'Employee view all by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @ApiOperation({ summary: 'Employee view all by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id')
  findAllByEmployeeId(@Param('school_id') school_id: string) {
    return this.employeeService.findAllByEmployeeId(+school_id);
  }

  @ApiOperation({ summary: 'Employee paginate' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.employeeService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Employee view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Employee update by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(+id, +school_id, updateEmployeeDto);
  }

  @ApiOperation({ summary: 'Employee remove by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.employeeService.remove(+id, +school_id);
  }
}
