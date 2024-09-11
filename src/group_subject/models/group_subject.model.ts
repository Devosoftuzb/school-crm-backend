import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';
import { Subject } from 'src/subject/models/subject.model';

interface GroupSubjectAttr {
  group_id: number;
  subject_id: number;
}

@Table({ tableName: 'group_subject' })
export class GroupSubject extends Model<GroupSubject, GroupSubjectAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

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
