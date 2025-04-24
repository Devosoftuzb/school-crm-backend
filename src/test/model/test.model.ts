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
import { Question } from 'src/questions/model/question.model';
import { Subject } from 'src/subject/models/subject.model';

interface TestAttr {
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
}
