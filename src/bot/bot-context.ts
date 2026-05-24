import { Context } from 'telegraf';

export interface MySession {
  step?:
    | 'await_fio'
    | 'await_phone'
    | 'await_child_phone'
    | 'registered_parent'
    | 'registered_student';
  role?: 'parent' | 'student';
  chatId?: string;
  fio?: string;
}

export interface MyContext extends Context {
  session: MySession;
}
