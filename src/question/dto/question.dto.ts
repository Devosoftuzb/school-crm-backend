import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class QuestionDto {
  @ApiProperty({
    type: 'string',
    example: 'How many data types are there in javascript?',
    description: 'question of test',
  })
  @IsNotEmpty({ message: 'Iltimos, savolni kiriting!' })
  @IsString({ message: 'Savol matn shaklida kiritilishi zarur!' })
  question: string;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of test group',
  })
  @IsNotEmpty({
    message: 'Iltimos, savol biriktirilgan test ID sini kiriting!',
  })
  @IsNumber({}, { message: "Test ID si son shaklida bo'lishi zarur!" })
  test_group_id: number;
}
