import { Injectable, Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { MyContext } from './bot-context';
import { StudentService } from '../student/student.service';

@Injectable()
export class BotStudentHandler {
  private readonly logger = new Logger(BotStudentHandler.name);

  constructor(
    private readonly studentService: StudentService,
    private readonly configService: ConfigService,
  ) {}

  private get schoolId(): number {
    return Number(this.configService.get<number>('SCHOOL_ID'));
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[\s+\-()]/g, '');
  }

  mainMenu(webAppUrl: string) {
    return Markup.keyboard([
      [Markup.button.webApp('📝 Test topshirish', webAppUrl)],
    ]).resize();
  }

  private cancelKeyboard() {
    return Markup.keyboard([['🔙 Bekor qilish']]).resize();
  }

  async getLinkedStudent(chatId: string) {
    const students = await this.studentService.findByStudentChatId(
      chatId,
      this.schoolId,
    );
    return students[0] || null;
  }

  async handlePhone(ctx: MyContext, phone: string): Promise<void> {
    const normalized = this.normalizePhone(phone);

    let fullNumber: string;
    if (/^\d{9}$/.test(normalized)) {
      fullNumber = '998' + normalized;
    } else if (/^998\d{9}$/.test(normalized)) {
      fullNumber = normalized;
    } else {
      await ctx.reply(
        "❌ Telefon raqam noto'g'ri formatda!\n\n📞 Format:\n*+998 XX XXX XX XX*",
        { parse_mode: 'Markdown', ...this.cancelKeyboard() },
      );
      return;
    }

    const students = await this.studentService.findByPhoneForBot(
      fullNumber,
      this.schoolId,
    );

    if (!students.length) {
      await ctx.reply(
        "❌ Bu raqam bo'yicha o'quvchi topilmadi.\n\n📞 Qayta kiriting:",
        { parse_mode: 'Markdown', ...this.cancelKeyboard() },
      );
      return;
    }

    if (students.length === 1) {
      await this.confirmAndLink(ctx, students[0].id);
      return;
    }

    const buttons = students.map((s) => [
      Markup.button.callback(
        `${s.full_name} | ${s.parents_full_name}`,
        `select_student:${s.id}`,
      ),
    ]);

    await ctx.reply(
      `📋 *${students.length} ta natija topildi.*\nO'zingizni tanlang:`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) },
    );
  }

  async confirmAndLink(ctx: MyContext, studentId: number): Promise<void> {
    const chatId = ctx.chat!.id.toString();
    const student = await this.studentService.findStudentByIdForBot(studentId);

    if (!student) {
      await ctx.reply("❌ O'quvchi topilmadi.");
      return;
    }

    const webAppUrl = this.configService.get<string>('WEB_APP_URL')!;
    await this.studentService.linkStudent(studentId, chatId);

    ctx.session.step = 'registered_student';
    ctx.session.role = 'student';

    await ctx.reply(
      `✅ Muvaffaqiyatli biriktirildi!\n\n` +
        `👤 *${student.full_name}*\n` +
        `📞 ${student.phone_number}`,
      { parse_mode: 'Markdown', ...this.mainMenu(webAppUrl) },
    );
  }

  async requestUnlink(ctx: MyContext, studentId: number): Promise<void> {
    const student = await this.studentService.findStudentByIdForBot(studentId);
    if (!student) return;

    await ctx.editMessageText(
      `❓ *${student.full_name}* ni ro'yxatdan o'chirmoqchimisiz?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "✅ Ha, o'chirish",
              `confirm_unlink_student:${studentId}`,
            ),
            Markup.button.callback("🔙 Yo'q", 'cancel_action'),
          ],
        ]),
      },
    );
  }

  async doUnlink(ctx: MyContext, studentId: number): Promise<void> {
    const webAppUrl = this.configService.get<string>('WEB_APP_URL')!;
    const student = await this.studentService.findStudentByIdForBot(studentId);
    await this.studentService.unlinkStudent(studentId);
    await ctx.editMessageText(
      `✅ ${student?.full_name} ro'yxatdan o'chirildi.`,
    );
    await ctx.reply('Bosh menyu 👇', this.mainMenu(webAppUrl));
  }
}
