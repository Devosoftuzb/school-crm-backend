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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';

@ApiTags('Sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiOperation({ summary: 'Sms send' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  sendSMS(@Body() createSmsDto: CreateSmDto) {
    return this.smsService.sendSMS(createSmsDto);
  }

  
}
