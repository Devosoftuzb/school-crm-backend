import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Employee } from 'src/employee/models/employee.model';
import { Subject } from 'src/subject/models/subject.model';

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
  })
  employee_id: number;

  @BelongsTo(() => Employee, {
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @Column({
    type: DataType.STRING,
  })
  subject_name: string;
}
