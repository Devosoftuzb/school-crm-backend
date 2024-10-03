import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { EmployeeGroup } from 'src/employee_group/models/employee_group.model';
import { EmployeeSubject } from 'src/employee_subject/models/employee_subject.model';
import { School } from 'src/school/models/school.model';

interface EmployeeAttr {
  school_id: number;
  full_name: string;
  phone_number: string;
  login: string;
  hashed_password: string;
  hashed_refresh_token: string;
  role: string;
}

@Table({ tableName: 'employee' })
export class Employee extends Model<Employee, EmployeeAttr> {
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
  full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: false, 
    unique: true, 
  })
  login: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  hashed_password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hashed_refresh_token: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  role: string;

  @HasMany(() => EmployeeGroup, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: EmployeeGroup[];

  @HasMany(() => EmployeeSubject, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  subject: EmployeeSubject[];
}
