import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SmsService } from './sms.service';
import { CreateSmsAttendanceDto, CreateSmsDevDto, CreateSmsPaymentDto } from './dto/create-sm.dto';

@ApiTags('Sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiOperation({ summary: 'Sms send' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post('payment')
  sendPayment(@Body() createSmsDto: CreateSmsPaymentDto) {
    return this.smsService.sendPayment(createSmsDto);
  }

  @ApiOperation({ summary: 'Sms send' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post('dev')
  sendDev(@Body() createSmsDto: CreateSmsDevDto) {
    return this.smsService.sendDev(createSmsDto);
  }

  @ApiOperation({ summary: 'Sms send' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post('attendance')
  sendAttendance(@Body() createSmsDto: CreateSmsAttendanceDto) {
    return this.smsService.sendAttendance(createSmsDto);
  }
}
