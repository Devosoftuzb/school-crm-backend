import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCostDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsInt()
  @IsNotEmpty()
  school_id: number;

  @ApiProperty({ example: 100000, description: 'Price of the cost' })
  @IsInt()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 1, description: 'Payment method ID' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({
    example: 'description',
    description: 'Description of the cost',
  })
  @IsNotEmpty()
  description: string;
}
