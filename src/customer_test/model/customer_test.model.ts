import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Customer } from 'src/customer/models/customer.model';
import { CustomerAnswer } from 'src/customer_answer/model/customer_answer.model';
import { School } from 'src/school/models/school.model';
import { Test } from 'src/test/model/test.model';

interface CustomerTestAttr {
  school_id: number;
  customer_id: number;
  test_id: number;
  started_at: string;
  finished_at: string;
  test_result: string;
  writing_result: string;
  overall_result: string;
  description: string;
}

@Table({ tableName: 'customer_test' })
export class CustomerTest extends Model<CustomerTest, CustomerTestAttr> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
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

  @ForeignKey(() => Customer)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', allowNull: false })
  customer_id: number;

  @BelongsTo(() => Customer, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

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

  @Column({ type: DataType.STRING, allowNull: false })
  started_at: string;

  @Column({ type: DataType.STRING, allowNull: false })
  finished_at: string;

  @Column({ type: DataType.STRING, allowNull: true })
  test_result: string;

  @Column({ type: DataType.STRING, allowNull: true })
  writing_result: string;

  @Column({ type: DataType.STRING, allowNull: true })
  overall_result: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @HasMany(() => CustomerAnswer, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer_answer: CustomerAnswer[];
}
