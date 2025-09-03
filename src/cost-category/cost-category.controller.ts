import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
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
  
    @ApiOperation({ summary: 'Cost category create' })
    @Roles('superadmin', 'admin', 'owner', 'administrator')
    @Post()
    create(@Body() createCostCategoryDto: CreateCostCategoryDto) {
      return this.costCategoryService.create(createCostCategoryDto);
    }
  
    @ApiOperation({ summary: 'Cost category view all by school ID' })
    @Roles('superadmin', 'admin')
    @Get()
    findAll() {
      return this.costCategoryService.findAll();
    }
  
    @ApiOperation({ summary: 'Cost category view all by school ID' })
    @Roles('superadmin', 'admin', 'owner', 'administrator')
    @Get(':school_id')
    findAllBySchoolId(@Param('school_id') school_id: string) {
      return this.costCategoryService.findAllBySchoolId(+school_id);
    }
  
    @ApiOperation({ summary: 'Cost category paginate' })
    @Roles('owner', 'administrator')
    @Get(':school_id/page')
    paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
      return this.costCategoryService.paginate(+school_id, page);
    }
  
    @ApiOperation({ summary: 'Cost category view by ID by school ID' })
    @Roles('owner', 'administrator')
    @Get(':school_id/:id')
    findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
      return this.costCategoryService.findOne(+id, +school_id);
    }
  
    @ApiOperation({ summary: 'Cost category update by ID by school ID' })
    @Roles('owner', 'administrator')
    @Put(':school_id/:id')
    update(
      @Param('id') id: string,
      @Param('school_id') school_id: string,
      @Body() updateCostCategoryDto: UpdateCostCategoryDto,
    ) {
      return this.costCategoryService.update(
        +id,
        +school_id,
        updateCostCategoryDto,
      );
    }
  
    @ApiOperation({ summary: 'Cost category remove by ID by school ID' })
    @Roles('owner', 'administrator')
    @Delete(':school_id/:id')
    remove(@Param('id') id: string, @Param('school_id') school_id: string) {
      return this.costCategoryService.remove(+id, +school_id);
    }
}
