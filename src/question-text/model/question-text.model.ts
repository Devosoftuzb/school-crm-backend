import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Question } from 'src/questions/model/question.model';

@Table({ tableName: 'question_text' })
export class QuestionText extends Model<QuestionText> {
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
