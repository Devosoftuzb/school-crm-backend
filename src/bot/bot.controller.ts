import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BotService } from './bot.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';

@ApiTags('Bot Notify')
@Controller('bot')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Version('1')
  @ApiOperation({ summary: "To'lov xabari yuborish (ota-onaga)" })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post('notify/payment')
  sendPayment(
    @Body()
    dto: {
      student_id: number;
      group_name: string;
      group_price: number;
      discount: number;
      discount_sum: number;
      paid_amount: number;
      month: string;
      year: string;
      method: string;
    },
  ) {
    return this.botService.sendPaymentNotification(dto);
  }

  @Version('1')
  @ApiOperation({ summary: "To'lov eslatmasi (guruh bo'yicha)" })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post('notify/payment-reminder')
  sendPaymentReminder(@Body() dto: { group_id: number }) {
    return this.botService.sendPaymentReminder(dto);
  }

  @Version('1')
  @ApiOperation({ summary: "Test natijasi yuborish (o'quvchiga)" })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post('notify/test-result')
  sendTestResult(
    @Body()
    dto: {
      student_id: number;
      test_name: string;
      score: number;
      total: number;
    },
  ) {
    return this.botService.sendTestResult(dto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Broadcast (reklam post)' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post('notify/broadcast')
  sendBroadcast(
    @Body()
    dto: {
      target: 'parents' | 'students' | 'all';
      text: string;
      photo?: string;
      buttons?: { label: string; url: string }[];
    },
  ) {
    return this.botService.sendBroadcast(dto);
  }
}
