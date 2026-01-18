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
  Res,
} from '@nestjs/common';
import { CostService } from './cost.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { Response } from 'express';

@ApiTags('Cost')
@Controller('cost')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Version('1')
  @ApiOperation({ summary: 'Cost create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createCostDto: CreateCostDto) {
    return this.costService.create(createCostDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Export excel by cost' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'teacher')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('excel/:school_id')
  async excelCostHistory(
    @Param('school_id') school_id: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('category_id') category_id?: string,
    @Res() res?: Response,
  ) {
    return this.costService.excelCostHistory(
      +school_id,
      year ? +year : undefined,
      month ? +month : undefined,
      category_id ? +category_id : undefined,
      res,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Cost paginate (universal)' })
  @Roles('owner', 'administrator')
  @Get(':school_id')
  paginateUniversal(
    @Param('school_id') school_id: string,

    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('category_id') category_id?: string,
    @Query('page') page = 1,
  ) {
    return this.costService.paginateUniversal({
      school_id: +school_id,
      year: year ? +year : undefined,
      month: month ? +month : undefined,
      category_id: category_id ? +category_id : undefined,
      page: +page,
    });
  }

  @Version('1')
  @ApiOperation({ summary: 'Cost view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.costService.findOne(+id, +school_id);
  }

  @Version('1')
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

  @Version('1')
  @ApiOperation({ summary: 'Cost remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.costService.remove(+id, +school_id);
  }
}
