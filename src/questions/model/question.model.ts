import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CustomerAnswer } from 'src/customer_answer/model/customer_answer.model';
import { Option } from 'src/option/model/option.model';
import { QuestionText } from 'src/question-text/model/question-text.model';
import { Test } from 'src/test/model/test.model';

interface QuestionAttr {
  type: string;
  test_id: number;
  text_id: number;
  file: string;
  question: string;
}

@Table({ tableName: 'question' })
export class Question extends Model<Question, QuestionAttr> {
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
  type: string;

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

  @ForeignKey(() => QuestionText)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: true,
  })
  text_id: number;

  @BelongsTo(() => QuestionText, {
    onDelete: 'CASCADE',
  })
  text: QuestionText;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  file: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  question: string;

  @HasMany(() => Option, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  option: Option[];

  @HasMany(() => CustomerAnswer, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer_answer: CustomerAnswer[];
}
