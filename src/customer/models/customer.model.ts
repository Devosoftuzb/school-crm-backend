import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CustomerTest } from 'src/customer_test/model/customer_test.model';
import { School } from 'src/school/models/school.model';
import { SocialMedia } from 'src/social_media/models/social_media.model';
import { Subject } from 'src/subject/models/subject.model';

interface CustomerAttr {
  school_id: number;
  full_name: string;
  phone_number: string;
  social_media_id: number;
  subject_id: number;
  description: string;
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

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  subject_id: number;

  @BelongsTo(() => Subject, { onDelete: 'CASCADE' })
  subject: Subject;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @HasMany(() => CustomerTest, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  customer_test: CustomerTest[];
}
