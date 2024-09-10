import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { School } from "src/school/models/school.model";

interface GroupAttr {
    school_id: number;
    name: string;
    price: string;
    start_date: string;
    room_id: number;
    days_id: number;
    start_time: string;
    end_time: string;
    status: boolean;
}

@Table({tableName: 'group'})
export class Group extends Model<Group, GroupAttr>{
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
      })
      school_id: number;
    
      @BelongsTo(() => School, {
        onDelete: 'CASCADE',
      })
      school: School;
    
      @Column({
        type: DataType.STRING,
      })
      name: string;
    
      @Column({
        type: DataType.STRING,
      })
      price: string;
    
      @Column({
        type: DataType.STRING,
      })
      start_date: string;

      @ForeignKey(() => School)
      @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
      })
      room_id: number;
    
      @BelongsTo(() => School, {
        onDelete: 'CASCADE',
      })
      room: School;

      @ForeignKey(() => School)
      @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
      })
      days_id: number;
    
      @BelongsTo(() => School, {
        onDelete: 'CASCADE',
      })
      days: School;
    
      @Column({
        type: DataType.STRING,
      })
      start_time: string;

      @Column({
        type: DataType.STRING,
      })
      end_time: string;
    
      @Column({
        type: DataType.BOOLEAN,
      })
      status: boolean;
}
