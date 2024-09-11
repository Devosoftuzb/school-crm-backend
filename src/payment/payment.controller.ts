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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Payment create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @ApiOperation({ summary: 'Payment view all by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @ApiOperation({ summary: 'Payment view all by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id')
  findAllByPaymentId(@Param('school_id') school_id: string) {
    return this.paymentService.findAllByPaymentId(+school_id);
  }

  @ApiOperation({ summary: 'Payment paginate' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.paymentService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Payment view by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Payment update by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(+id, +school_id, updatePaymentDto);
  }

  @ApiOperation({ summary: 'Payment remove by ID by school ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.paymentService.remove(+id, +school_id);
  }
}
