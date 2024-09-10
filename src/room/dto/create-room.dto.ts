import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: '15 - room', description: 'Room name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
