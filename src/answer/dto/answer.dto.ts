import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AnswerDto {
  @ApiProperty({
    type: 'string',
    example: 'Javascript has 7 data types',
    description: 'answer to question',
  })
  @IsNotEmpty({ message: 'Iltimos, A variantni kiriting!' })
  @IsString({ message: 'Variant matn shaklida kiritilishi kerak!' })
  a: string;

  @ApiProperty({
    type: 'string',
    example: 'Javascript has 7 data types',
    description: 'answer to question',
  })
  @IsNotEmpty({ message: 'Iltimos, B variantni kiriting!' })
  @IsString({ message: 'Variant matn shaklida kiritilishi kerak!' })
  b: string;

  @ApiProperty({
    type: 'string',
    example: 'Javascript has 7 data types',
    description: 'answer to question',
  })
  @IsNotEmpty({ message: 'Iltimos, C variantni kiriting!' })
  @IsString({ message: 'Variant matn shaklida kiritilishi kerak!' })
  c: string;

  @ApiProperty({
    type: 'string',
    example: 'Javascript has 7 data types',
    description: 'answer to question',
  })
  @IsNotEmpty({ message: 'Iltimos, D variantni kiriting!' })
  @IsString({ message: 'Variant matn shaklida kiritilishi kerak!' })
  d: string;

  @ApiProperty({
    type: 'string',
    example: 'a',
    description: 'true answer to question',
  })
  @IsNotEmpty({ message: "Iltimos, to'g'ri variantni kiriting!" })
  @IsString({ message: 'Javob matn shaklida kiritilishi kerak!' })
  true_answer: string;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'question id',
  })
  @IsNotEmpty({ message: 'Iltimos, variantlarga savolni biriktiring!' })
  @IsNumber({}, { message: 'Savol ID si kiritilmadi!' })
  question_id: number;
}
