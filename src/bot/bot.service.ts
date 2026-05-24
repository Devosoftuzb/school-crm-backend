import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { MyContext } from './bot-context';
import { StudentService } from '../student/student.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<MyContext>,
    private readonly studentService: StudentService,
    private readonly configService: ConfigService,
  ) {}

  async sendPaymentNotification(dto: {
    student_id: number;
    group_name: string;
    group_price: number;
    discount: number;
    discount_sum: number;
    paid_amount: number;
    month: string;
    year: string;
    method: string;
  }): Promise<void> {
    try {
      const student = await this.studentService.findStudentByIdForBot(
        dto.student_id,
      );
      if (!student?.parents_chat_id) return;

      const priceAfterDiscount =
        dto.group_price -
        Math.round(dto.group_price * (dto.discount / 100)) -
        dto.discount_sum;

      const monthNames: Record<string, string> = {
        '01': 'Yanvar',
        '02': 'Fevral',
        '03': 'Mart',
        '04': 'Aprel',
        '05': 'May',
        '06': 'Iyun',
        '07': 'Iyul',
        '08': 'Avgust',
        '09': 'Sentabr',
        '10': 'Oktabr',
        '11': 'Noyabr',
        '12': 'Dekabr',
      };

      const monthName = monthNames[dto.month.padStart(2, '0')] || dto.month;

      const text =
        `✅ Farzandingiz to'lov qildi!\n\n` +
        `📋 To'lov tafsiloti:\n` +
        `👤 O'quvchi: ${student.full_name}\n` +
        `📚 Guruh: ${dto.group_name}\n` +
        `🏷 Guruh narxi: ${dto.group_price.toLocaleString('uz-UZ')} so'm\n` +
        (dto.discount > 0 ? `🎁 Chegirma: ${dto.discount}%\n` : '') +
        (dto.discount_sum > 0
          ? `🎁 Chegirma summasi: ${dto.discount_sum.toLocaleString('uz-UZ')} so'm\n`
          : '') +
        `💵 Chegirmadan keyin: ${priceAfterDiscount.toLocaleString('uz-UZ')} so'm\n` +
        `💰 To'langan summa: ${dto.paid_amount.toLocaleString('uz-UZ')} so'm\n` +
        `📅 Oy: ${monthName} ${dto.year}\n` +
        `💳 To'lov turi: ${dto.method}`;

      await this.bot.telegram.sendMessage(student.parents_chat_id, text);
    } catch (error) {
      this.logger.error('sendPaymentNotification error', error);
    }
  }

  async sendPaymentReminder(dto: { group_id: number }): Promise<void> {
    try {
      const schoolId = Number(this.configService.get('SCHOOL_ID'));
      const students = await this.studentService.findAllByParentChatIdInGroup(
        schoolId,
        dto.group_id,
      );

      for (const student of students) {
        try {
          const text =
            `⚠️ To'lov eslatmasi\n\n` +
            `Hurmatli ${student.parents_full_name || 'ota-ona'},\n` +
            `*${student.full_name}* uchun joriy oy to'lovi kutilmoqda.\n` +
            `Iltimos, o'z vaqtida amalga oshiring.`;

          await this.bot.telegram.sendMessage(student.parents_chat_id, text, {
            parse_mode: 'Markdown',
          });
        } catch (err) {
          this.logger.warn(`chatId ${student.parents_chat_id} xatolik`, err);
        }
      }
    } catch (error) {
      this.logger.error('sendPaymentReminder error', error);
    }
  }

  async sendAttendanceNotification(dto: {
    student_id: number;
  }): Promise<{ via: 'bot' | 'sms' | 'skip' }> {
    try {
      const student = await this.studentService.findStudentByIdForBot(
        dto.student_id,
      );
      if (!student) return { via: 'skip' };

      if (student.parents_chat_id) {
        const text =
          `📌 Davomat xabari\n\n` +
          `*${student.full_name}* bugun darsda qatnashmadi.\n` +
          `Doimiy qatnashish — yaxshi natija uchun muhim!`;

        await this.bot.telegram.sendMessage(student.parents_chat_id, text, {
          parse_mode: 'Markdown',
        });
        return { via: 'bot' };
      }

      return { via: 'sms' };
    } catch (error) {
      this.logger.error('sendAttendanceNotification error', error);
      return { via: 'skip' };
    }
  }

  async sendTestResult(dto: {
    student_id: number;
    test_name: string;
    score: number;
    total: number;
  }): Promise<void> {
    try {
      const student = await this.studentService.findStudentByIdForBot(
        dto.student_id,
      );
      if (!student?.student_chat_id) return;

      const percentage = Math.round((dto.score / dto.total) * 100);
      const text =
        `📊 Test natijasi\n\n` +
        `📝 Test: ${dto.test_name}\n` +
        `👤 O'quvchi: ${student.full_name}\n` +
        `✅ Ball: ${dto.score} / ${dto.total}\n` +
        `📈 Foiz: ${percentage}%`;

      await this.bot.telegram.sendMessage(student.student_chat_id, text);
    } catch (error) {
      this.logger.error('sendTestResult error', error);
    }
  }

  async sendBroadcast(dto: {
    target: 'parents' | 'students' | 'all';
    text: string;
    photo?: string;
    buttons?: { label: string; url: string }[];
  }): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const schoolId = Number(this.configService.get('SCHOOL_ID'));
    const students = await this.studentService.findAllWithChatIds(
      schoolId,
      dto.target,
    );

    const chatIds = new Set<string>();
    for (const s of students) {
      if (
        (dto.target === 'parents' || dto.target === 'all') &&
        s.parents_chat_id
      ) {
        chatIds.add(s.parents_chat_id);
      }
      if (
        (dto.target === 'students' || dto.target === 'all') &&
        s.student_chat_id
      ) {
        chatIds.add(s.student_chat_id);
      }
    }

    const inlineKeyboard = dto.buttons?.length
      ? {
          inline_keyboard: [
            dto.buttons.map((b) => ({ text: b.label, url: b.url })),
          ],
        }
      : undefined;

    for (const chatId of chatIds) {
      try {
        if (dto.photo) {
          await this.bot.telegram.sendPhoto(chatId, dto.photo, {
            caption: dto.text,
            reply_markup: inlineKeyboard,
          });
        } else {
          await this.bot.telegram.sendMessage(chatId, dto.text, {
            reply_markup: inlineKeyboard,
          });
        }
        sent++;
      } catch (err) {
        this.logger.warn(`Broadcast failed chatId ${chatId}`, err);
        failed++;
      }
    }

    return { sent, failed };
  }
}
