import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { School } from 'src/school/models/school.model';
import { Student } from 'src/student/models/student.model';

interface StudentAttendanceAttr {
  school_id: number;
  student_id: number;
  type: 'IN' | 'OUT';
  time?: Date;
}

@Table({ tableName: 'student_attendance' })
export class StudentAttendance extends Model<
  StudentAttendance,
  StudentAttendanceAttr
> {
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

  @Column({
    type: DataType.ENUM('IN', 'OUT'),
    allowNull: false,
  })
  type: 'IN' | 'OUT';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  time: Date;
}
