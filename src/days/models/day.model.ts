import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';

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

  @HasMany(() => Group, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: Group;
}
