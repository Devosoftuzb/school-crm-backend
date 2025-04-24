import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTestDto {
  @ApiProperty({ example: 1, description: 'Subject ID' })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({ example: 50, description: 'Question count' })
  @IsNumber()
  @IsNotEmpty()
  count: number;

  @ApiProperty({ example: 90, description: 'Test time' })
  @IsNumber()
  @IsNotEmpty()
  time: number;
}
