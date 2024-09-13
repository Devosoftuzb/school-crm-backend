import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Student } from 'src/student/models/student.model';
import { TestGroup } from 'src/test-group/models/test-group.model';
import { TestResult } from 'src/test-result/models/test-result.model';

interface TestTimeAttributes {
  start_time: Date;
  end_time: Date;
  student_id: number;
  test_group_id: number;
}

@Table({ tableName: 'test-time' })
export class TestTime extends Model<TestTime, TestTimeAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  start_time: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  end_time: Date;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
  })
  student_id: number;

  @ForeignKey(() => TestGroup)
  @Column({
    type: DataType.INTEGER,
  })
  test_group_id: number;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => TestGroup)
  test_group: TestGroup;

  @HasMany(() => TestResult, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  test_results: TestResult[];
}
