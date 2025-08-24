import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSalaryDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsInt()
  @IsNotEmpty()
  school_id: number;

  @ApiProperty({ example: 1, description: 'Teacher ID' })
  @IsInt()
  @IsNotEmpty()
  teacher_id: number;

  @ApiProperty({ example: 10000, description: 'Price salary' })
  @IsInt()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'Method name', description: 'Payment method name' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ example: 'Month', description: 'Payment month' })
  @IsString()
  @IsNotEmpty()
  month: string;
}
