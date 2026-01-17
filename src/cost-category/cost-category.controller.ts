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
import { CostCategoryService } from './cost-category.service';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { UpdateCostCategoryDto } from './dto/update-cost-category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';

@ApiTags('Cost Category')
@Controller('cost-category')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CostCategoryController {
  constructor(private readonly costCategoryService: CostCategoryService) {}

  @Version('1')
  @ApiOperation({ summary: 'Cost category create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createCostCategoryDto: CreateCostCategoryDto) {
    return this.costCategoryService.create(createCostCategoryDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Cost category view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.costCategoryService.findAllBySchoolId(+school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Cost category remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.costCategoryService.remove(+id, +school_id);
  }
}
