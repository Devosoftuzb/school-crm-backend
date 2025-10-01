import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Employee } from 'src/employee/models/employee.model';
import { School } from 'src/school/models/school.model';

interface SalartAttr {
  school_id: number;
  teacher_id: number;
  price: number;
  method: string;
  month: string;
  description: string;
}

@Table({ tableName: 'salary' })
export class Salary extends Model<Salary, SalartAttr> {
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

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  teacher_id: number;

  @BelongsTo(() => Employee, {
    onDelete: 'CASCADE',
  })
  teacher: Employee;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  method: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  month: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;
}
