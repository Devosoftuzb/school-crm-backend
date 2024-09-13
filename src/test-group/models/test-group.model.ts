import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Question } from 'src/question/models/question.model';
import { Subject } from 'src/subject/models/subject.model';
import { TestResult } from 'src/test-result/models/test-result.model';
import { TestSubmit } from 'src/test-submit/models/test-submit.model';
import { TestTime } from 'src/test-time/models/test-time.model';

interface TestGroupAttributes {
  test_count: number;
  test_time: number;
  subject_id: number;
}

@Table({ tableName: 'test-group' })
export class TestGroup extends Model<TestGroup, TestGroupAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  test_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  test_time: number;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
  })
  subject_id: number;

  @BelongsTo(() => Subject)
  subject: Subject;

  @HasMany(() => Question, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  questions: Question[];

  @HasMany(() => TestResult, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  test_results: TestResult[];

  @HasMany(() => TestSubmit, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  test_submits: TestSubmit[];

  @HasMany(() => TestTime, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  test_times: TestTime[];
}
