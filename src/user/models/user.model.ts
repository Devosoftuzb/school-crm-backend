import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { School } from 'src/school/models/school.model';

interface UserAttr {
  full_name: string;
  phone_number: string;
  login: string;
  hashed_password: string;
  hashed_refresh_token: string;
  role: string;
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  login: string;

  @Column({
    type: DataType.STRING,
  })
  hashed_password: string;

  @Column({
    type: DataType.STRING,
  })
  hashed_refresh_token: string;

  @Column({
    type: DataType.STRING,
  })
  role: string;

  @HasMany(() => School, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  school: School;
}
