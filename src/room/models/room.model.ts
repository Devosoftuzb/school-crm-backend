import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Group } from 'src/group/models/group.model';
import { School } from 'src/school/models/school.model';

interface RoomAttr {
  school_id: number;
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
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @HasMany(() => Group, {
    hooks: true,
  })
  group: Group[];
}
