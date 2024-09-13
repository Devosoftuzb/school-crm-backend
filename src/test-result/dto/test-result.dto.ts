import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TestResultDto {
  @ApiProperty({
    type: 'string',
    example: 'A',
    description: "student'a answer",
  })
  @IsNotEmpty({ message: 'Iltimos, javobingizni kiriting!' })
  @IsString({ message: 'Javob matn shaklida kiritilishi zarur!' })
  answer: string;

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
    example: '1',
    description: 'test group id',
  })
  @IsNotEmpty({ message: 'Iltimos, test ID sini kiriting!' })
  @IsNumber({}, { message: "Test ID si son shaklida bo'lishi zarur!" })
  test_group_id: number;

  @ApiProperty({
    type: 'number',
    example: '26',
    description: 'questtion id',
  })
  @IsNotEmpty({ message: 'Iltimos, savol ID sini kiriting!' })
  @IsNumber({}, { message: "Savol ID si son shaklida bo'lishi zarur!" })
  question_id: number;

  @ApiProperty({
    type: 'number',
    example: '3',
    description: 'test time id',
  })
  @IsNotEmpty({ message: 'Iltimos, test vaqti ID sini kiriting!' })
  @IsNumber({}, { message: "Test vaqti ID si son shaklida bo'lishi zarur!" })
  test_time_id: number;
}
