import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { BotUpdate } from './bot.update';
import { BotParentHandler } from './bot.parent';
import { StudentModule } from '../student/student.module';

const LocalSession = require('telegraf-session-local');

@Module({
  imports: [
    StudentModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const session = new LocalSession({ database: 'session.json' });
        return {
          token: configService.get<string>('BOT_TOKEN')!,
          middlewares: [session.middleware()],
        };
      },
    }),
  ],
  providers: [BotUpdate, BotParentHandler],
  exports: [TelegrafModule],
})
export class BotModule {}