import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TestGroupDto {
  @ApiProperty({
    type: 'number',
    example: '50',
    description: 'count of test',
  })
  @IsNotEmpty({
    message: 'Iltimos, test savollarining umumiy sonini kiriting!',
  })
  @IsNumber(
    {},
    { message: 'Savollarning umumiy qiymati son shaklida kiritilishi zarur!' },
  )
  test_count: number;

  @ApiProperty({
    type: 'string',
    example: '2 hours',
    description: 'time of test',
  })
  @IsNotEmpty({ message: 'Iltimos, testga beriladigan vaqtni kiriting!' })
  @IsNumber(
    {},
    { message: 'Testga beriladigan vaqt son shaklida kiritilishi zarur!' },
  )
  test_time: number;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of subject',
  })
  @IsNotEmpty({
    message: 'Iltimos, testga biriktiriladigan fan ID sini kiriting!',
  })
  @IsNumber({}, { message: 'Fan ID si son shaklida kiritilishi zarur!' })
  subject_id: number;
}
