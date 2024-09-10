import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSmDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: 'text', description: 'Sms text' })
  @IsString()
  text: string;
}
