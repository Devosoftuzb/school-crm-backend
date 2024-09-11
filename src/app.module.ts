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
import { RoomModule } from './room/room.module';
import { SmsModule } from './sms/sms.module';
import { DaysModule } from './days/days.module';
import { Day } from './days/models/day.model';
import { Room } from './room/models/room.model';
import { GroupDayModule } from './group_day/group_day.module';
import { StudentGroupModule } from './student_group/student_group.module';
import { GroupDay } from './group_day/models/group_day.model';
import { StudentGroup } from './student_group/models/student_group.model';
import { PaymentMethodModule } from './payment_method/payment_method.module';
import { PaymentModule } from './payment/payment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PaymentMethod } from './payment_method/models/payment_method.model';
import { Payment } from './payment/models/payment.model';
import { Attendance } from './attendance/models/attendance.model';
import { EmployeeModule } from './employee/employee.module';
import { EmployeeGroupModule } from './employee_group/employee_group.module';
import { Employee } from './employee/models/employee.model';
import { EmployeeGroup } from './employee_group/models/employee_group.model';

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
      models: [
        User,
        School,
        Student,
        Group,
        Day,
        Room,
        GroupDay,
        StudentGroup,
        PaymentMethod,
        Payment,
        Attendance,
        Employee,
        EmployeeGroup
      ],
      autoLoadModels: true,
      logging: false,
    }),
    JwtModule,
    UserModule,
    AuthModule,
    SchoolModule,
    StudentModule,
    GroupModule,
    RoomModule,
    SmsModule,
    DaysModule,
    GroupDayModule,
    StudentGroupModule,
    PaymentMethodModule,
    PaymentModule,
    AttendanceModule,
    EmployeeModule,
    EmployeeGroupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
