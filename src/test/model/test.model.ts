import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CustomerTest } from 'src/customer_test/model/customer_test.model';
import { QuestionText } from 'src/question-text/model/question-text.model';
import { Question } from 'src/questions/model/question.model';
import { School } from 'src/school/models/school.model';
import { Subject } from 'src/subject/models/subject.model';

interface TestAttr {
  school_id: number;
  subject_id: number;
  count: number;
  time: number;
}

@Table({ tableName: 'test' })
export class Test extends Model<Test, TestAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => School)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  school_id: number;

  @BelongsTo(() => School, {
    onDelete: 'CASCADE',
  })
  school: School;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  subject_id: number;

  @BelongsTo(() => Subject, {
    onDelete: 'CASCADE',
  })
  subject: Subject;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  time: number;

  @HasMany(() => Question, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  questions: Question[];

  @HasMany(() => CustomerTest, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer_test: CustomerTest[];

  @HasMany(() => QuestionText, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  question_text: QuestionText[];
}
