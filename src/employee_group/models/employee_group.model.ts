import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Employee } from 'src/employee/models/employee.model';
import { Group } from 'src/group/models/group.model';

interface EmployeeGroupAttr {
  employee_id: number;
  group_id: number;
  group_name: string;
}

@Table({ tableName: 'employee_group' })
export class EmployeeGroup extends Model<EmployeeGroup, EmployeeGroupAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  employee_id: number;

  @BelongsTo(() => Employee, {
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  group_id: number;

  @BelongsTo(() => Group, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @Column({
    type: DataType.STRING,
  })
  group_name: string;
}
