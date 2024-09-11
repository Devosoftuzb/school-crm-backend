import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { School } from 'src/school/models/school.model';
import { Student } from 'src/student/models/student.model';

interface AttendanceAttr {
  school_id: number;
  student_id: number;
  status: boolean;
}

@Table({ tableName: 'attendance' })
export class Attendance extends Model<Attendance, AttendanceAttr> {
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
    type: DataType.BOOLEAN,
  })
  status: boolean;
}
