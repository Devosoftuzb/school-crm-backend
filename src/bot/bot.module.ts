import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BotUpdate } from './bot.update';
import { BotParentHandler } from './bot.parent';
import { BotStudentHandler } from './bot.student';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { StudentModule } from '../student/student.module';
import { session } from 'telegraf';
import Redis from 'ioredis';

@Module({
  imports: [
    StudentModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_KEY'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        });

        return {
          token: configService.get<string>('BOT_TOKEN')!,
          middlewares: [
            session({
              store: {
                async get(key: string) {
                  const val = await redis.get(key);
                  return val ? JSON.parse(val) : undefined;
                },
                async set(key: string, value: unknown) {
                  await redis.set(key, JSON.stringify(value), 'EX', 86400);
                },
                async delete(key: string) {
                  await redis.del(key);
                },
              },
            }),
          ],
        };
      },
    }),
  ],
  controllers: [BotController],
  providers: [BotUpdate, BotParentHandler, BotStudentHandler, BotService],
  exports: [BotService, TelegrafModule],
})
export class BotModule {}
