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

  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: '2024', description: 'Payment year' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ example: 'September', description: 'Payment month' })
  month: string;

  @ApiProperty({ example: "Terminal", description: 'Payment method name' })
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiProperty({ example: 50, description: 'Payment discount' })
  @IsNotEmpty()
  @IsInt()
  discount: number;

  @ApiProperty({ example: 1, description: 'Payment price' })
  @IsNotEmpty()
  @IsInt()
  price: number;

  @ApiProperty({ example: "Description", description: 'Payment description' })
  description: string;
}
