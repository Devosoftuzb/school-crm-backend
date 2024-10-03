import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Day } from 'src/days/models/day.model';
import { Group } from 'src/group/models/group.model';

interface GroupDayAttr {
  group_id: number;
  day_id: number;
}

@Table({ tableName: 'group_day' })
export class GroupDay extends Model<GroupDay, GroupDayAttr> {
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

  @ForeignKey(() => Day)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  day_id: number;

  @BelongsTo(() => Day, {
    onDelete: 'CASCADE',
  })
  day: Day;
}
