import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOptionDto {
  @ApiProperty({ example: 1, description: 'Question ID' })
  @IsNumber()
  @IsNotEmpty()
  question_id: number;

  @ApiProperty({ example: 'Option', description: 'Question option' })
  @IsString()
  @IsNotEmpty()
  option: string;

  @ApiProperty({ example: true, description: 'True option' })
  @IsBoolean()
  @IsNotEmpty()
  is_correct: boolean;
}
