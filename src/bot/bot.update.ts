import { Update, Ctx, Start, On, Action } from 'nestjs-telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import { MyContext } from './bot-context';
import { BotParentHandler } from './bot.parent';

@Update()
@Injectable()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private readonly botParentHandler: BotParentHandler) {}

  @Start()
  async start(@Ctx() ctx: MyContext): Promise<void> {
    try {
      if (!ctx.chat) return;

      const chatId = ctx.chat.id.toString();
      ctx.session.chatId = chatId;

      const children = await this.botParentHandler.getLinkedChildren(chatId);

      if (children.length > 0) {
        const parentName =
          ctx.session.fio ||
          children[0].parents_full_name ||
          'Hurmatli ota-ona';

        ctx.session.step = 'registered';
        await ctx.reply(
          `Assalomu alaykum, *${parentName}*! 👋\n` +
            `*Sayimov Academy* nazorat botiga xush kelibsiz!`,
          { parse_mode: 'Markdown', ...this.botParentHandler.mainMenu() },
        );
        return;
      }

      ctx.session.step = 'await_fio';
      await ctx.reply(
        'Assalomu alaykum!\n*Sayimov Academy* nazorat botiga xush kelibsiz! 👋\n\n' +
          'Davom etish uchun ism va familiyangizni kiriting:',
        { parse_mode: 'Markdown', ...Markup.removeKeyboard() },
      );
    } catch (error: any) {
      this.logger.error('Error in start', error);
      await this.safeReply(ctx);
    }
  }

  @On('text')
  async handleText(@Ctx() ctx: MyContext): Promise<void> {
    try {
      if (!ctx.message || !('text' in ctx.message)) return;

      const text = ctx.message.text;
      const step = ctx.session.step;

      if (text === '🔙 Bekor qilish') {
        ctx.session.step = 'registered';
        await ctx.reply('Bekor qilindi.', this.botParentHandler.mainMenu());
        return;
      }

      if (text === '👨‍👩‍👧 Farzandlarim') {
        await this.botParentHandler.showChildren(ctx);
        return;
      }

      if (text === "➕ Farzand qo'shish") {
        await this.botParentHandler.startAddChild(ctx);
        return;
      }

      if (step === 'await_fio') {
        await this.botParentHandler.handleFio(ctx, text);
        return;
      }

      if (step === 'await_child_phone') {
        await this.botParentHandler.handleChildPhone(ctx, text);
        return;
      }

      if (ctx.chat) {
        const chatId = ctx.chat.id.toString();
        const children = await this.botParentHandler.getLinkedChildren(chatId);

        if (children.length > 0) {
          // Farzandi bor — menyuni ko'rsat
          ctx.session.step = 'registered';
          await ctx.reply('Bosh menyu 👇', this.botParentHandler.mainMenu());
        } else {
          // Hech narsa yo'q — /start bosishini ayt
          await ctx.reply('Iltimos /start dan boshlang.');
        }
      }
    } catch (error: any) {
      this.logger.error('Error handling text', error);
      await this.safeReply(ctx);
    }
  }

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

  @Action('cancel_action')
  async onCancelAction(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.answerCbQuery('Bekor qilindi');
    await ctx.editMessageText('❌ Bekor qilindi.');
    await ctx.reply('Bosh menyu 👇', this.botParentHandler.mainMenu());
  }

  private async safeReply(ctx: MyContext): Promise<void> {
    try {
      await ctx.reply(
        'Xatolik yuz berdi. Iltimos /start dan qaytadan boshlang.',
      );
    } catch {}
  }
}
