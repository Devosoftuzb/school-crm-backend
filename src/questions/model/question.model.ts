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
import { Test } from 'src/test/model/test.model';

interface QuestionAttr {
  test_id: number;
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
