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
    allowNull: false,
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
    allowNull: false,
  })
  group_id: number;

  @BelongsTo(() => Group, {
    onDelete: 'CASCADE',
  })
  group: Group;

}
