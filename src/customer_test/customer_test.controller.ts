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
import { CustomerTestService } from './customer_test.service';
import { CreateCustomerTestDto } from './dto/create-customer_test.dto';
import { UpdateCustomerTestDto } from './dto/update-customer_test.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';

@ApiTags('Customer Test')
@Controller('customer-test')
export class CustomerTestController {
  constructor(private readonly customerTestService: CustomerTestService) {}

  @ApiOperation({ summary: 'CustomerTest create' })
  @Post()
  create(@Body() createCustomerTestDto: CreateCustomerTestDto) {
    return this.customerTestService.create(createCustomerTestDto);
  }

  @ApiOperation({ summary: 'CustomerTest view all' })
  @Get('getSchoolId/:school_id')
  findAll(@Param('school_id') school_id: string) {
    return this.customerTestService.findAll(+school_id);
  }

  @ApiOperation({ summary: 'CustomerTest paginate' })
  @Get(':school_id/page')
  paginate(@Param('school_id') school_id: string, @Query('page') page: number) {
    return this.customerTestService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'CustomerTest view by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerTestService.findOne(+id);
  }

  @ApiOperation({ summary: 'CustomerTest update by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerTestDto: UpdateCustomerTestDto,
  ) {
    return this.customerTestService.update(+id, updateCustomerTestDto);
  }

  @ApiOperation({ summary: 'CustomerTest remove by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerTestService.remove(+id);
  }
}
