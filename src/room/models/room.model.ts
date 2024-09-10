import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';

interface RoomAttr {
  name: string;
  status: string;
}

@Table({ tableName: 'room' })
export class Room extends Model<Room, RoomAttr> {
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

  @Column({
    type: DataType.STRING,
  })
  status: string;

  @HasMany(() => Group, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  group: Group;
}
