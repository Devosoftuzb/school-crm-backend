import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SchoolModule } from './school/school.module';
import { User } from './user/models/user.model';
import { School } from './school/models/school.model';
import { StudentModule } from './student/student.module';
import { Student } from './student/models/student.model';
import { GroupModule } from './group/group.module';
import { Group } from './group/models/group.model';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: String(process.env.POSTGRES_PASS),
      database: process.env.POSTGRES_DB,
      models: [User, School, Student, Group],
      autoLoadModels: true,
      logging: false,
    }),
    JwtModule,
    UserModule,
    AuthModule,
    SchoolModule,
    StudentModule,
    GroupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
