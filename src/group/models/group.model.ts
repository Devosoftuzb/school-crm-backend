import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Attendance } from "src/attendance/models/attendance.model";
import { Day } from "src/days/models/day.model";
import { EmployeeGroup } from "src/employee_group/models/employee_group.model";
import { GroupDay } from "src/group_day/models/group_day.model";
import { GroupSubject } from "src/group_subject/models/group_subject.model";
import { Payment } from "src/payment/models/payment.model";
import { Room } from "src/room/models/room.model";
import { School } from "src/school/models/school.model";
import { StudentGroup } from "src/student_group/models/student_group.model";

interface GroupAttr {
    school_id: number;
    name: string;
    price: string;
    start_date: string;
    room_id: number;
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
      price: string;
    
      @Column({
        type: DataType.STRING,
        allowNull: false,
      })
      start_date: string;

      @ForeignKey(() => Room)
      @Column({
        type: DataType.INTEGER,
        onDelete: 'CASCADE',
        allowNull: false,
      })
      room_id: number;
    
      @BelongsTo(() => Room, {
        onDelete: 'CASCADE',
      })
      room: School;
    
      @Column({
        type: DataType.STRING,
        allowNull: false,
      })
      start_time: string;

      @Column({
        type: DataType.STRING,
        allowNull: false,
      })
      end_time: string;
    
      @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
      })
      status: boolean;

      @HasMany(() => GroupDay, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      group: GroupDay[];

      @HasMany(() => StudentGroup, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      student: StudentGroup[];

      @HasMany(() => EmployeeGroup, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      employee: EmployeeGroup[];

      @HasMany(() => GroupSubject, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      subject: GroupSubject[];

      @HasMany(() => Payment, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      payment: Payment[];

      @HasMany(() => Attendance, {
        onDelete: 'CASCADE',
        hooks: true,
      })
      attendance: Attendance[];
}
