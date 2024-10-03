import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';

interface GroupSubjectAttr {
  group_id: number;
  subject_name: string;
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
    allowNull: false,
  })
  group_id: number;

  @BelongsTo(() => Group, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subject_name: string;
}
