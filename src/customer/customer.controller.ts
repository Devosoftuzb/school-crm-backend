import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateWebCustomerDto } from './dto/create-web-customer.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Version('1')
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'View a customer by ID and school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.customerService.findOne(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Update a customer by ID and school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, +school_id, updateCustomerDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Remove a customer by ID and school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.customerService.remove(+id, +school_id);
  }

  @ApiOperation({ summary: 'Login customer' })
  @Post('/login')
  createWeb(@Body() createWebCustomerDto: CreateWebCustomerDto) {
    return this.customerService.createWeb(createWebCustomerDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Customer history month view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('year/:school_id/:year/page')
  findYearHistory(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Query('page') page: number,
  ) {
    return this.customerService.findYearHistory(+school_id, +year, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Customer history month view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('month/:school_id/:year/:month/page')
  findMonthHistory(
    @Param('school_id') school_id: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('page') page: number,
  ) {
    return this.customerService.findMonthHistory(
      +school_id,
      +year,
      +month,
      page,
    );
  }

  @Version('1')
  @ApiOperation({ summary: 'Search customer by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search/:school_id/:name')
  searchName(
    @Param('school_id') school_id: string,
    @Param('name') name: string,
  ) {
    return this.customerService.searchName(+school_id, name);
  }

  @Version('1')
  @ApiOperation({ summary: 'Update a customer by ID and school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Put('status/:school_id/:id')
  updateStatus(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.customerService.updateStatus(+id, +school_id, updateStatusDto);
  }
}
