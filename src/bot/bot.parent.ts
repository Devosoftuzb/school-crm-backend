import { Injectable, Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { MyContext } from './bot-context';
import { StudentService } from '../student/student.service';

@Injectable()
export class BotParentHandler {
  private readonly logger = new Logger(BotParentHandler.name);

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

  mainMenu() {
    return Markup.keyboard([
      ['👨‍👩‍👧 Farzandlarim', "➕ Farzand qo'shish"],
    ]).resize();
  }

  private phoneInputKeyboard() {
    return Markup.keyboard([['🔙 Bekor qilish']]).resize();
  }

  async getLinkedChildren(chatId: string) {
    return this.studentService.findByParentChatId(chatId, this.schoolId);
  }

  async handleFio(ctx: MyContext, fio: string): Promise<void> {
    const trimmed = fio.trim();
    if (trimmed.length < 3) {
      await ctx.reply("⚠️ Iltimos to'liq ism-familiya kiriting:");
      return;
    }

    ctx.session.fio = trimmed;
    ctx.session.step = 'await_child_phone';

    await ctx.reply(
      `Rahmat, *${trimmed}*! 👋\n\n` +
        `📞 Farzandingizning telefon raqamini kiriting:\n` +
        `_Namuna: +998 xx xxx xx xx_`,
      { parse_mode: 'Markdown', ...this.phoneInputKeyboard() },
    );
  }

  async handleChildPhone(ctx: MyContext, phone: string): Promise<void> {
    const normalized = this.normalizePhone(phone);

    // ✅ 9 ta raqam (901234567) yoki 12 ta (998901234567) — ikkalasini qabul qil
    let fullNumber: string;
    if (/^\d{9}$/.test(normalized)) {
      fullNumber = '998' + normalized;
    } else if (/^998\d{9}$/.test(normalized)) {
      fullNumber = normalized;
    } else {
      await ctx.reply(
        "❌ Telefon raqam noto'g'ri formatda!\n\n" +
          '📞 Quyidagi formatda kiriting:\n' +
          '*+998 XX XXX XX XX*\n\n' +
          '_Namuna: +998 90 123 45 67_',
        { parse_mode: 'Markdown', ...this.phoneInputKeyboard() },
      );
      return;
    }

    const students = await this.studentService.findByPhoneForBot(
      fullNumber,
      this.schoolId,
    );

    if (!students.length) {
      await ctx.reply(
        "❌ Bu raqam bo'yicha o'quvchi topilmadi.\n\n" +
          '📞 Qayta kiriting:\n' +
          '_Namuna: +998 90 123 45 67_',
        { parse_mode: 'Markdown', ...this.phoneInputKeyboard() },
      );
      return;
    }

    if (students.length === 1) {
      await this.confirmAndLink(ctx, students[0].id);
      return;
    }

    // ✅ Faqat tugmalar — ro'yxat yo'q, raqamsiz faqat FIO
    const buttons = students.map((s) => [
      Markup.button.callback(s.full_name, `select_child:${s.id}`),
    ]);

    await ctx.reply(
      `📋 *${students.length} ta o'quvchi topildi.*\nFarzandingizni tanlang:`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) },
    );
  }

  async confirmAndLink(ctx: MyContext, studentId: number): Promise<void> {
    const chatId = ctx.chat!.id.toString();
    const student = await this.studentService.findStudentByIdForBot(studentId);

    if (!student) {
      await ctx.reply("❌ O'quvchi topilmadi. Qayta urinib ko'ring.");
      return;
    }

    let parentName = ctx.session.fio;

    if (!parentName) {
      const existing = await this.studentService.findByParentChatId(
        chatId,
        this.schoolId,
      );
      parentName = existing[0]?.parents_full_name || '';
    }

    await this.studentService.linkParent(studentId, chatId, parentName);
    ctx.session.step = 'registered';

    await ctx.reply(
      `✅ Muvaffaqiyatli biriktirildi!\n\n` +
        `👤 O'quvchi: *${student.full_name}*\n` +
        `📞 Telefon: ${student.phone_number}`,
      { parse_mode: 'Markdown', ...this.mainMenu() },
    );
  }

  async startAddChild(ctx: MyContext): Promise<void> {
    ctx.session.step = 'await_child_phone';
    await ctx.reply(
      "📞 Qo'shmoqchi bo'lgan farzandingizning telefon raqamini kiriting:\n" +
        '_Namuna: +998 xx xxx xx xx_',
      { parse_mode: 'Markdown', ...this.phoneInputKeyboard() },
    );
  }

  async showChildren(ctx: MyContext): Promise<void> {
    const chatId = ctx.chat!.id.toString();
    const students = await this.studentService.findByParentChatId(
      chatId,
      this.schoolId,
    );

    if (!students.length) {
      await ctx.reply(
        "👨‍👩‍👧 Hali farzand biriktirilmagan.\n\n➕ Farzand qo'shish tugmasini bosing.",
        this.mainMenu(),
      );
      return;
    }

    const buttons = students.map((s, i) => [
      Markup.button.callback(
        `❌ ${i + 1}. ${s.full_name}`,
        `unlink_child:${s.id}`,
      ),
    ]);

    const list = students
      .map((s, i) => `${i + 1}. 👤 ${s.full_name} — 📞 ${s.phone_number}`)
      .join('\n');

    await ctx.reply(
      `👨‍👩‍👧 *Farzandlarim:*\n\n${list}\n\n_(O'chirish uchun tugmani bosing)_`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) },
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
              `confirm_unlink:${studentId}`,
            ),
            Markup.button.callback("🔙 Yo'q", 'cancel_action'),
          ],
        ]),
      },
    );
  }

  async doUnlink(ctx: MyContext, studentId: number): Promise<void> {
    const student = await this.studentService.findStudentByIdForBot(studentId);
    await this.studentService.unlinkParent(studentId);

    await ctx.editMessageText(
      `✅ ${student?.full_name} ro'yxatdan o'chirildi.`,
    );
    await ctx.reply('Bosh menyu 👇', this.mainMenu());
  }
}
