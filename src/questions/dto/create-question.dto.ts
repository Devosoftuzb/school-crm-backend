import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ example: 1, description: 'Test ID' })
  @IsNumber()
  @IsNotEmpty()
  test_id: number;

  @ApiProperty({ example: 'media', description: 'Question media' })
  file: any;

  @ApiProperty({ example: 'Text', description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;
}
