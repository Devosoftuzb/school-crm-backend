import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TestSubmitDto {
  @ApiProperty({
    type: 'boolean',
    example: 'true',
    description: 'student submitted test',
  })
  @IsNotEmpty({ message: 'Iltimos, test topshirilganini tasdiqlang!' })
  @IsBoolean({ message: "Test tasdiqlashi to'g'ri formatda bo'lishi kerak!" })
  is_submit: boolean;

  @ApiProperty({
    type: 'number',
    example: '26',
    description: 'student correct answers',
  })
  correct_answers: number;

  @ApiProperty({
    type: 'number',
    example: 1,
    description: 'student id',
  })
  @IsNotEmpty({ message: 'Iltimos, talaba ID sini kiriting!' })
  @IsInt()
  student_id: number;

  @ApiProperty({
    type: 'number',
    example: '15',
    description: 'test group id',
  })
  @IsNotEmpty({ message: 'Iltimos, test ID sini kiriting!' })
  @IsNumber({}, { message: "Test ID si son shaklida bo'lishi zarur!" })
  test_group_id: number;
}
