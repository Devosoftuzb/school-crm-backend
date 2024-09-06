import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface StudentAttr {
  school_id: number;
  parents_full_name: string;
  parents_phone_number: string;
  full_name: string;
  phone_number: string;
  status: boolean;
}

@Table({ tableName: 'student' })
export class Student extends Model<Student, StudentAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
  })
  school_id: number;

  @Column({
    type: DataType.STRING,
  })
  parents_full_name: string;

  @Column({
    type: DataType.STRING,
  })
  parents_phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  status: boolean;
}
