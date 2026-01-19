import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface NotificationAttr {
  image: string;
  title: string;
  note: string;
}

@Table({ tableName: 'notification' })
export class Notification extends Model<Notification, NotificationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  note: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;
}
