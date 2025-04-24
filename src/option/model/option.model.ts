import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Question } from 'src/questions/model/question.model';

interface OptionAttr {
  question_id: number;
  option: string;
  is_correct: boolean;
}

@Table({ tableName: 'option' })
export class Option extends Model<Option, OptionAttr> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => Question)
  @Column({ type: DataType.INTEGER, allowNull: false })
  question_id: number;

  @BelongsTo(() => Question)
  question: Question;

  @Column({ type: DataType.STRING, allowNull: false })
  option: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_correct: boolean;
}
