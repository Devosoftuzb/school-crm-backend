import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Day } from "src/days/models/day.model";
import { Room } from "src/room/models/room.model";
import { School } from "src/school/models/school.model";
import { Sms } from "src/sms/models/sms.model";

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

      @ForeignKey(() => Room)
      @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
      })
      room_id: number;
    
      @BelongsTo(() => Room, {
        onDelete: 'CASCADE',
      })
      room: School;

      @ForeignKey(() => Day)
      @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
      })
      days_id: number;
    
      @BelongsTo(() => Day, {
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

      @HasMany(() => Sms, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      sms: Sms;
}
