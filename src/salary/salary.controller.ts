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
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';

@ApiTags('Salary')
@Controller('salary')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @ApiOperation({ summary: 'Salary create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @ApiOperation({ summary: 'Salary view all by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.salaryService.findAll();
  }

  @ApiOperation({ summary: 'Salary view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.salaryService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Salary paginate' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.salaryService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Salary view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.salaryService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Salary update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.salaryService.update(+id, +school_id, updateSalaryDto);
  }

  @ApiOperation({ summary: 'Salary remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.salaryService.remove(+id, +school_id);
  }
}
