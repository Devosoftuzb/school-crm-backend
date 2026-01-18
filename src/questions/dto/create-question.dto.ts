import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOptionDto } from 'src/option/dto/create-option.dto';

export class CreateQuestionDto {
  @ApiProperty({ example: 1, description: 'Test ID' })
  @IsNumber()
  @IsNotEmpty()
  test_id: number;

  @ApiProperty({ example: 1, description: 'Text ID' })
  @IsNumber()
  text_id: number;

  @ApiProperty({ example: 'media', description: 'Question media' })
  file: any;

  @ApiProperty({ example: 'Text', description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    type: [CreateOptionDto],
    description: 'Question options',
    example: [
      { option: 'go', is_correct: true },
      { option: 'went', is_correct: false },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}
