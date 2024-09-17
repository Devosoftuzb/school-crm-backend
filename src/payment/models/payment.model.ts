import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';
import { PaymentMethod } from 'src/payment_method/models/payment_method.model';
import { School } from 'src/school/models/school.model';
import { Student } from 'src/student/models/student.model';

interface PaymentAttr {
  school_id: number;
  student_id: number;
  group_id: number
  year: string;
  month: string;
  method_id: number;
  discount: number;
  price: number;
}

@Table({ tableName: 'payment' })
export class Payment extends Model<Payment, PaymentAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => School)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  school_id: number;

  @BelongsTo(() => School, {
    onDelete: 'CASCADE',
  })
  school: School;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  student_id: number;

  @BelongsTo(() => Student, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  group_id: number;

  @BelongsTo(() => Group, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @Column({
    type: DataType.STRING,
  })
  year: string;

  @Column({
    type: DataType.STRING,
  })
  month: string;

  @ForeignKey(() => PaymentMethod)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  method_id: number;

  @BelongsTo(() => PaymentMethod, {
    onDelete: 'CASCADE',
  })
  method: PaymentMethod;

  @Column({
    type: DataType.INTEGER,
  })
  discount: number;

  @Column({
    type: DataType.INTEGER,
  })
  price: number;
}
