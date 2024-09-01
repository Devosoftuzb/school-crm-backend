import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';

interface SchoolAttr {
  name: string;
  address: string;
}

@Table({ tableName: 'school' })
export class School extends Model<School, SchoolAttr> {
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
  address: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
  })
  owner_id: number;

  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
  })
  owner: User;
}
