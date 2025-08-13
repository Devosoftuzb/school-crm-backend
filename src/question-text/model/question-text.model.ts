import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Question } from 'src/questions/model/question.model';
import { Test } from 'src/test/model/test.model';

@Table({ tableName: 'question_text' })
export class QuestionText extends Model<QuestionText> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Test)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  test_id: number;

  @BelongsTo(() => Test, {
    onDelete: 'CASCADE',
  })
  test: Test;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @HasMany(() => Question, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  question: Question[];
}
