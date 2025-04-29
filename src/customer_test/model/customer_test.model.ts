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
import { Test } from 'src/test/model/test.model';

interface CustomerTestAttr {
  customer_id: number;
  test_id: number;
  started_at: string;
  finished_at: string;
}

@Table({ tableName: 'customer_test' })
export class CustomerTest extends Model<CustomerTest, CustomerTestAttr> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

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

  @HasMany(() => CustomerAnswer, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer_answer: CustomerAnswer[];
}
