import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Attendance } from 'src/attendance/models/attendance.model';
import { Employee } from 'src/employee/models/employee.model';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';
import { PaymentMethod } from 'src/payment_method/models/payment_method.model';
import { Student } from 'src/student/models/student.model';
import { User } from 'src/user/models/user.model';

interface SchoolAttr {
  name: string;
  address: string;
}

@Table({ tableName: 'school' })
export class School extends Model<School, SchoolAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  address: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  owner_id: number;

  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @HasMany(() => Student, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  student: Student;

  @HasMany(() => Group, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: Group;

  @HasMany(() => PaymentMethod, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  paymentMethod: PaymentMethod;

  @HasMany(() => Payment, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  payment: Payment;

  @HasMany(() => Attendance, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  attendance: Attendance;

  @HasMany(() => Employee, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  employee: Employee;
}
