import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: 'Backend N=1', description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '100000', description: 'Group price' })
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty({ example: '09-09-2024', description: 'Group start date' })
  @IsString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: 1, description: 'Room ID' })
  @IsInt()
  @IsNotEmpty()
  room_id: number;

  @ApiProperty({ example: 1, description: 'Days ID' })
  @IsInt()
  @IsNotEmpty()
  days_id: number;

  @ApiProperty({ example: '18:00', description: 'Group start time' })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({ example: '20:00', description: 'Group end time' })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({ example: true, description: 'Group status' })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
