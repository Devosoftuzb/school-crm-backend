import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { School } from 'src/school/models/school.model';

interface PaymentMethodAttr {
  school_id: number;
  name: string;
}

@Table({ tableName: 'payment_method' })
export class PaymentMethod extends Model<PaymentMethod, PaymentMethodAttr> {
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
}
