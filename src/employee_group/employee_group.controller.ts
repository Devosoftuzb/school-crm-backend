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
import { EmployeeGroupService } from './employee_group.service';
import { CreateEmployeeGroupDto } from './dto/create-employee_group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Employee Group')
@Controller('employee-group')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class EmployeeGroupController {
  constructor(private readonly employeeGroupService: EmployeeGroupService) {}

  @Version('1')
  @ApiOperation({ summary: 'Employee Group create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createEmployeeGroupDto: CreateEmployeeGroupDto) {
    return this.employeeGroupService.create(createEmployeeGroupDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Employee Group view by ID' })
  @Roles('owner', 'administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeGroupService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Employee Group remove by ID' })
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeGroupService.remove(+id);
  }
}
