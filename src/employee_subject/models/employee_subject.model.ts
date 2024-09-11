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
  subject_id: number;
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

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  subject_id: number;

  @BelongsTo(() => Subject, {
    onDelete: 'CASCADE',
  })
  subject: Subject;
}
