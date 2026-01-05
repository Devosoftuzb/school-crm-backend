import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CustomerTest } from 'src/customer_test/model/customer_test.model';
import { Option } from 'src/option/model/option.model';
import { Question } from 'src/questions/model/question.model';

interface CustomerAnswerAttr {
  customer_test_id: number;
  question_id: number;
  option_id: number;
  is_correct: boolean;
  writing: string;
}

@Table({ tableName: 'customer_answer' })
export class CustomerAnswer extends Model<CustomerAnswer, CustomerAnswerAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => CustomerTest)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  customer_test_id: number;

  @BelongsTo(() => CustomerTest, {
    onDelete: 'CASCADE',
  })
  customer_test: CustomerTest;

  @ForeignKey(() => Question)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  question_id: number;

  @BelongsTo(() => Question, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @ForeignKey(() => Option)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: true,
  })
  option_id: number;

  @BelongsTo(() => Option, {
    onDelete: 'CASCADE',
  })
  option: Option;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: null,
  })
  is_correct: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  writing: string;
}
