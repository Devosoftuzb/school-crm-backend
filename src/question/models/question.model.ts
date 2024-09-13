import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Answer } from 'src/answer/models/answer.model';
import { TestGroup } from 'src/test-group/models/test-group.model';
import { TestResult } from 'src/test-result/models/test-result.model';

interface QuestionAttributes {
  question: string;
  test_group_id: number;
}

@Table({ tableName: 'question' })
export class Question extends Model<Question, QuestionAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  question: string;

  @ForeignKey(() => TestGroup)
  @Column({
    type: DataType.INTEGER,
  })
  test_group_id: number;

  @BelongsTo(() => TestGroup)
  test_group: TestGroup;

  @HasMany(() => Answer, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  answers: Answer[];

  @HasMany(()=> TestResult, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  test_results: TestResult[];
}
