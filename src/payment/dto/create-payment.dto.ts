import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNotEmpty()
  @IsInt()
  student_id: number;

  @ApiProperty({ example: '2024', description: 'Payment year' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ example: 'September', description: 'Payment month' })
  month: string;

  @ApiProperty({ example: 1, description: 'Payment method ID' })
  @IsNotEmpty()
  @IsInt()
  method_id: number;

  @ApiProperty({ example: 50, description: 'Payment discount' })
  @IsNotEmpty()
  @IsInt()
  discount: number;

  @ApiProperty({ example: 1, description: 'Payment price' })
  @IsNotEmpty()
  @IsInt()
  price: number;
}
