import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';
import { Student } from 'src/student/models/student.model';

interface StudentGroupAttr {
  student_id: number;
  group_id: number;
  group_name: string;
}

@Table({ tableName: 'student_group' })
export class StudentGroup extends Model<StudentGroup, StudentGroupAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

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
  group_name: string;
}
