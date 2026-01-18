import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: '15 - room', description: 'Room name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'status', description: 'Room status' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
