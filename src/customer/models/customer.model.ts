import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { School } from 'src/school/models/school.model';
import { SocialMedia } from 'src/social_media/models/social_media.model';

interface CustomerAttr {
  school_id: number;
  full_name: string;
  phone_number: string;
  social_media_id: number;
}

@Table({ tableName: 'customer' })
export class Customer extends Model<Customer, CustomerAttr> {
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

  @BelongsTo(() => School, { onDelete: 'CASCADE' })
  school: School;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false, 
  })
  phone_number: string;

  @ForeignKey(() => SocialMedia)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false, 
  })
  social_media_id: number;

  @BelongsTo(() => SocialMedia, { onDelete: 'CASCADE' })
  social_media: SocialMedia;
}
