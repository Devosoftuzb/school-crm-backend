import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Employee } from 'src/employee/models/employee.model';

interface EmployeeSubjectAttr {
  employee_id: number;
  subject_name: string;
}

@Table({ tableName: 'employee_subject' })
export class EmployeeSubject extends Model<
  EmployeeSubject,
  EmployeeSubjectAttr
> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subject_name: string;
}
