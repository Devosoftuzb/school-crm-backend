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
import { Payment } from 'src/payment/models/payment.model';
import { School } from 'src/school/models/school.model';
import { StudentGroup } from 'src/student_group/models/student_group.model';

interface StudentAttr {
  school_id: number;
  parents_full_name: string;
  parents_phone_number: string;
  full_name: string;
  phone_number: string;
  status: boolean;
}

@Table({ tableName: 'student' })
export class Student extends Model<Student, StudentAttr> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  parents_full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  parents_phone_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  status: boolean;

  @HasMany(() => StudentGroup, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: StudentGroup[];

  @HasMany(() => Payment, {
    hooks: true,
    onDelete: 'SET NULL',
  })
  payment: Payment[];

  @HasMany(() => Attendance, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  attendance: Attendance[];
}
