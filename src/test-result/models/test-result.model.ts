import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Question } from 'src/question/models/question.model';
import { Student } from 'src/student/models/student.model';
import { TestGroup } from 'src/test-group/models/test-group.model';
import { TestTime } from 'src/test-time/models/test-time.model';

interface TestResultAttributes {
  answer: string;
  student_id: number;
  test_group_id: number;
  question_id: number;
  test_time_id: number;
}

@Table({ tableName: 'test-result' })
export class TestResult extends Model<TestResult, TestResultAttributes> {
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
  answer: string;

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

  @ForeignKey(() => Question)
  @Column({
    type: DataType.INTEGER,
  })
  question_id: number;

  @ForeignKey(() => TestTime)
  @Column({
    type: DataType.INTEGER,
  })
  test_time_id: number;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => TestGroup)
  test_group: TestGroup;

  @BelongsTo(() => Question)
  question: Question;

  @BelongsTo(() => TestTime)
  test_time: TestTime;
}
