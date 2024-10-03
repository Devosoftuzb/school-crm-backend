import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Customer')
@Controller('customer')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Create a new customer' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @ApiOperation({ summary: 'View all customers by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @ApiOperation({ summary: 'View all customers by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.customerService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Paginate customers by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.customerService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'View a customer by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.customerService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Update a customer by ID and school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, +school_id, updateCustomerDto);
  }

  @ApiOperation({ summary: 'Remove a customer by ID and school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.customerService.remove(+id, +school_id);
  }
}
