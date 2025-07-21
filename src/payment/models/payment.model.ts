import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';
import { School } from 'src/school/models/school.model';
import { Student } from 'src/student/models/student.model';

interface PaymentAttr {
  school_id: number;
  student_id: number;
  group_id: number;
  year: string;
  month: string;
  method: string;
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
    allowNull: false,
  })
  school_id: number;

  @BelongsTo(() => School, {
    onDelete: 'CASCADE',
  })
  school: School;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onDelete: 'SET NULL',
  })
  student_id: number;

  @BelongsTo(() => Student, {
    onDelete: 'SET NULL',
  })
  student: Student;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  group_id: number;

  @BelongsTo(() => Group, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  year: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  month: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  method: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  discount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;
}
