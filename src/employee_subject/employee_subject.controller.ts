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
} from '@nestjs/common';
import { EmployeeSubjectService } from './employee_subject.service';
import { CreateEmployeeSubjectDto } from './dto/create-employee_subject.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Employee Subject')
@Controller('employee-subject')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class EmployeeSubjectController {
  constructor(
    private readonly employeeSubjectService: EmployeeSubjectService,
  ) {}

  @Version('1')
  @ApiOperation({ summary: 'Employee Subject create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createEmployeeSubjectDto: CreateEmployeeSubjectDto) {
    return this.employeeSubjectService.create(createEmployeeSubjectDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Employee Subject view by ID' })
  @Roles('owner', 'administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeSubjectService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Employee Subject remove by ID' })
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeSubjectService.remove(+id);
  }
}
