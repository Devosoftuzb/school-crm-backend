import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CostCategory } from 'src/cost-category/models/cost-category.model';
import { School } from 'src/school/models/school.model';

interface CostAttr {
  school_id: number;
  category_id: number;
  price: number;
  method: string;
  month: string;
  description: string;
}

@Table({ tableName: 'costs' })
export class Cost extends Model<Cost, CostAttr> {
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

  @ForeignKey(() => CostCategory)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    allowNull: false,
  })
  category_id: number;

  @BelongsTo(() => CostCategory, {
    onDelete: 'CASCADE',
  })
  costCategory: CostCategory;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  method: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  month: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;
}
