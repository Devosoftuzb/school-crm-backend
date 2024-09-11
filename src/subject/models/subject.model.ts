import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { EmployeeSubject } from 'src/employee_subject/models/employee_subject.model';
import { GroupSubject } from 'src/group_subject/models/group_subject.model';
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
  })
  school_id: number;

  @BelongsTo(() => School, {
    onDelete: 'CASCADE',
  })
  school: School;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @HasMany(() => GroupSubject, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: GroupSubject;

  @HasMany(() => EmployeeSubject, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  employee: EmployeeSubject;
}
