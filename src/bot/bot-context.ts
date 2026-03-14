import { Context } from 'telegraf';

export interface MySession {
  step?: 'await_fio' | 'await_child_phone' | 'registered';
  chatId?: string;
  fio?: string;
}

export interface MyContext extends Context {
  session: MySession;
}