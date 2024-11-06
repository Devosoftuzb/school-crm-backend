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

import { School } from 'src/school/models/school.model';

interface SubjectAttr {
  school_id: number;
  name: string;
}

@Table({ tableName: 'subject' })
export class Subject extends Model<Subject, SubjectAttr> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @HasMany(() => Customer, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer: Customer;
}
