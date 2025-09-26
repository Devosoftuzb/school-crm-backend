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
import { CostService } from './cost.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';

@ApiTags('Cost')
@Controller('cost')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @ApiOperation({ summary: 'Cost create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createCostDto: CreateCostDto) {
    return this.costService.create(createCostDto);
  }

  @ApiOperation({ summary: 'Cost view all by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.costService.findAll();
  }

  @ApiOperation({ summary: 'Cost view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.costService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Cost paginate' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:year/:month/page')
  paginate(
    @Query('page') page: number,
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.costService.paginate(+school_id, +year, +month, page);
  }

  @ApiOperation({ summary: 'Cost paginate' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:year/:month/:cost_category_id/page')
  paginateCategory(
    @Query('page') page: number,
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('cost_category_id') cost_category_id: string,
  ) {
    return this.costService.paginateCategory(+school_id, +year, +month, +cost_category_id, page);
  }

  @ApiOperation({ summary: 'Cost view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.costService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Cost update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateCostDto: UpdateCostDto,
  ) {
    return this.costService.update(+id, +school_id, updateCostDto);
  }

  @ApiOperation({ summary: 'Cost remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.costService.remove(+id, +school_id);
  }
}
