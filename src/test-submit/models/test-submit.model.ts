import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Student } from 'src/student/models/student.model';
import { TestGroup } from 'src/test-group/models/test-group.model';

interface TestSubmitAttributes {
  is_submit: boolean;
  correct_answers: number;
  student_id: number;
  test_group_id: number;
}

@Table({ tableName: 'test-submit' })
export class TestSubmit extends Model<TestSubmit, TestSubmitAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_submit: boolean;

  @Column({
    type: DataType.INTEGER,
  })
  correct_answers: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
  })
  student_id: number;

  @ForeignKey(() => TestGroup)
  @Column({
    type: DataType.INTEGER,
  })
  test_group_id: number;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => TestGroup)
  test_group: TestGroup;
}
