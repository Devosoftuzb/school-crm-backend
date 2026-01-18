import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { CustomerAnswerService } from './customer_answer.service';
import { CreateCustomerAnswerDto } from './dto/create-customer_answer.dto';
import { UpdateCustomerAnswerDto } from './dto/update-customer_answer.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';

@ApiTags('Customer answer')
@Controller('customer-answer')
export class CustomerAnswerController {
  constructor(private readonly customerAnswerService: CustomerAnswerService) {}

 @ApiOperation({ summary: 'CustomerAnswer create' })
   @Post()
   create(@Body() createCustomerAnswerDto: CreateCustomerAnswerDto) {
     return this.customerAnswerService.create(createCustomerAnswerDto);
   }
 
   @ApiOperation({ summary: 'CustomerAnswer paginate' })
   @Get('page')
   paginate(@Query('page') page: number) {
     return this.customerAnswerService.paginate(page);
   }
 
   @ApiOperation({ summary: 'CustomerAnswer view by ID' })
   @Get(':id')
   findOne(@Param('id') id: string) {
     return this.customerAnswerService.findOne(+id);
   }
 
   @ApiOperation({ summary: 'CustomerAnswer remove by ID' })
   @UseGuards(RolesGuard, JwtAuthGuard)
   @ApiBearerAuth('access-token')
   @Roles('owner', 'administrator')
   @Delete(':id')
   remove(@Param('id') id: string) {
     return this.customerAnswerService.remove(+id);
   }
}
