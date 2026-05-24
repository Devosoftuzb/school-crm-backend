import { Update, Ctx, Start, On, Action } from 'nestjs-telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import { MyContext } from './bot-context';
import { BotParentHandler } from './bot.parent';
import { BotStudentHandler } from './bot.student';
import { ConfigService } from '@nestjs/config';

@Update()
@Injectable()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly botParentHandler: BotParentHandler,
    private readonly botStudentHandler: BotStudentHandler,
    private readonly configService: ConfigService,
  ) {}

  private get webAppUrl(): string {
    return this.configService.get<string>('WEB_APP_URL')!;
  }

  // ─── START ────────────────────────────────────────────────
  @Start()
  async start(@Ctx() ctx: MyContext): Promise<void> {
    try {
      if (!ctx.chat) return;
      const chatId = ctx.chat.id.toString();

      // Ota-ona bo'lib ro'yxatdan o'tganmi?
      const asParent = await this.botParentHandler.getLinkedChildren(chatId);
      if (asParent.length > 0) {
        ctx.session.step = 'registered_parent';
        ctx.session.role = 'parent';
        await ctx.reply(
          `Assalomu alaykum, *${asParent[0].parents_full_name || 'Hurmatli ota-ona'}*! 👋`,
          { parse_mode: 'Markdown', ...this.botParentHandler.mainMenu() },
        );
        return;
      }

      // O'quvchi bo'lib ro'yxatdan o'tganmi?
      const asStudent = await this.botStudentHandler.getLinkedStudent(chatId);
      if (asStudent) {
        ctx.session.step = 'registered_student';
        ctx.session.role = 'student';
        await ctx.reply(`Assalomu alaykum, *${asStudent.full_name}*! 👋`, {
          parse_mode: 'Markdown',
          ...this.botStudentHandler.mainMenu(this.webAppUrl),
        });
        return;
      }

      // Yangi foydalanuvchi
      ctx.session.step = undefined;
      ctx.session.role = undefined;
      await ctx.reply(
        'Assalomu alaykum! *Sayimov Academy* botiga xush kelibsiz! 👋\n\nDavom etish uchun tanlang:',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "👨‍👩‍👧 Ota-ona bo'lib ro'yxatdan o'tish",
                'role_parent',
              ),
            ],
            [
              Markup.button.callback(
                "🎓 O'quvchi bo'lib ro'yxatdan o'tish",
                'role_student',
              ),
            ],
            [Markup.button.webApp('📝 Test topshirish', this.webAppUrl)],
          ]),
        },
      );
    } catch (error) {
      this.logger.error('Error in start', error);
      await this.safeReply(ctx);
    }
  }

  // ─── ROL TANLASH ──────────────────────────────────────────
  @Action('role_parent')
  async onRoleParent(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    ctx.session.role = 'parent';
    ctx.session.step = 'await_child_phone';
    await ctx.editMessageText(
      '📞 Farzandingizning telefon raqamini kiriting:\n_Namuna: +998 90 123 45 67_',
      { parse_mode: 'Markdown' },
    );
  }

  @Action('role_student')
  async onRoleStudent(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    ctx.session.role = 'student';
    ctx.session.step = 'await_phone';
    await ctx.editMessageText(
      "📞 O'z telefon raqamingizni kiriting:\n_Namuna: +998 90 123 45 67_",
      { parse_mode: 'Markdown' },
    );
  }

  // ─── TEXT HANDLER ─────────────────────────────────────────
  @On('text')
  async handleText(@Ctx() ctx: MyContext): Promise<void> {
    try {
      if (!ctx.message || !('text' in ctx.message)) return;
      const text = ctx.message.text;
      const step = ctx.session.step;
      const role = ctx.session.role;

      // Bekor qilish
      if (text === '🔙 Bekor qilish') {
        ctx.session.step =
          role === 'student' ? 'registered_student' : 'registered_parent';
        if (role === 'student') {
          await ctx.reply(
            'Bekor qilindi.',
            this.botStudentHandler.mainMenu(this.webAppUrl),
          );
        } else {
          await ctx.reply('Bekor qilindi.', this.botParentHandler.mainMenu());
        }
        return;
      }

      // Ota-ona menyusi
      if (text === '👨‍👩‍👧 Farzandlarim') {
        await this.botParentHandler.showChildren(ctx);
        return;
      }
      if (text === "➕ Farzand qo'shish") {
        await this.botParentHandler.startAddChild(ctx);
        return;
      }

      // Stepga qarab yo'naltirish
      if (step === 'await_child_phone') {
        await this.botParentHandler.handleChildPhone(ctx, text);
        return;
      }

      if (step === 'await_phone') {
        await this.botStudentHandler.handlePhone(ctx, text);
        return;
      }

      // Ro'yxatdan o'tgan — menyuni ko'rsat
      if (step === 'registered_parent') {
        await ctx.reply('Bosh menyu 👇', this.botParentHandler.mainMenu());
        return;
      }

      if (step === 'registered_student') {
        await ctx.reply(
          'Bosh menyu 👇',
          this.botStudentHandler.mainMenu(this.webAppUrl),
        );
        return;
      }

      // Hech narsa yo'q — start bosishni ayt
      await ctx.reply('Iltimos /start dan boshlang.');
    } catch (error) {
      this.logger.error('Error handling text', error);
      await this.safeReply(ctx);
    }
  }

  // ─── PARENT ACTIONS ───────────────────────────────────────
  @Action(/^select_child:(\d+)$/)
  async onSelectChild(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    const studentId = parseInt((ctx as any).match[1]);
    await this.botParentHandler.confirmAndLink(ctx, studentId);
  }

  @Action(/^unlink_child:(\d+)$/)
  async onUnlinkChild(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    const studentId = parseInt((ctx as any).match[1]);
    await this.botParentHandler.requestUnlink(ctx, studentId);
  }

  @Action(/^confirm_unlink:(\d+)$/)
  async onConfirmUnlink(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    const studentId = parseInt((ctx as any).match[1]);
    await this.botParentHandler.doUnlink(ctx, studentId);
  }

  // ─── STUDENT ACTIONS ──────────────────────────────────────
  @Action(/^select_student:(\d+)$/)
  async onSelectStudent(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    const studentId = parseInt((ctx as any).match[1]);
    await this.botStudentHandler.confirmAndLink(ctx, studentId);
  }

  @Action(/^unlink_student:(\d+)$/)
  async onUnlinkStudent(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    const studentId = parseInt((ctx as any).match[1]);
    await this.botStudentHandler.requestUnlink(ctx, studentId);
  }

  @Action(/^confirm_unlink_student:(\d+)$/)
  async onConfirmUnlinkStudent(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery();
    const studentId = parseInt((ctx as any).match[1]);
    await this.botStudentHandler.doUnlink(ctx, studentId);
  }

  // ─── UMUMIY ACTIONS ───────────────────────────────────────
  @Action('cancel_action')
  async onCancelAction(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery('Bekor qilindi');
    await ctx.editMessageText('❌ Bekor qilindi.');
    const role = ctx.session.role;
    if (role === 'student') {
      await ctx.reply(
        'Bosh menyu 👇',
        this.botStudentHandler.mainMenu(this.webAppUrl),
      );
    } else {
      await ctx.reply('Bosh menyu 👇', this.botParentHandler.mainMenu());
    }
  }

  private async safeReply(ctx: MyContext): Promise<void> {
    try {
      await ctx.reply(
        'Xatolik yuz berdi. Iltimos /start dan qaytadan boshlang.',
      );
    } catch {}
  }
}
