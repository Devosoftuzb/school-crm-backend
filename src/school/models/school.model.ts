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
import { Customer } from 'src/customer/models/customer.model';
import { CustomerTest } from 'src/customer_test/model/customer_test.model';
import { Employee } from 'src/employee/models/employee.model';
import { Group } from 'src/group/models/group.model';
import { Payment } from 'src/payment/models/payment.model';
import { PaymentMethod } from 'src/payment_method/models/payment_method.model';
import { SocialMedia } from 'src/social_media/models/social_media.model';
import { Student } from 'src/student/models/student.model';
import { Subject } from 'src/subject/models/subject.model';
import { Test } from 'src/test/model/test.model';
import { User } from 'src/user/models/user.model';

interface SchoolAttr {
  name: string;
  address: string;
  owner_id: number;
  image: string;
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
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  owner_id: number;

  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  owner: User;

  @HasMany(() => Student, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  student: Student[];

  @HasMany(() => Group, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: Group[];

  @HasMany(() => PaymentMethod, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  paymentMethod: PaymentMethod[];

  @HasMany(() => Payment, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  payment: Payment[];

  @HasMany(() => Attendance, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  attendance: Attendance[];

  @HasMany(() => Employee, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  employee: Employee[];

  @HasMany(() => Subject, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  subject: Subject[];

  @HasMany(() => SocialMedia, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  socialMedia: SocialMedia[];

  @HasMany(() => Customer, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer: Customer[];

  @HasMany(() => Test, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  test: Test[];

  @HasMany(() => CustomerTest, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer_test: CustomerTest[];
}
