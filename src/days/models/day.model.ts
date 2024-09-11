import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { GroupDay } from 'src/group_day/models/group_day.model';

interface DaysAttr {
  name: string;
}

@Table({ tableName: 'days' })
export class Day extends Model<Day, DaysAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @HasMany(() => GroupDay, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: GroupDay;
}
