import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCustomerTestDto {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({ example: 1, description: 'Test ID' })
  @IsNumber()
  @IsNotEmpty()
  test_id: number;

  @ApiProperty({ example: 'datetime', description: 'Started datetime' })
  @IsString()
  @IsNotEmpty()
  started_at: string;

  @ApiProperty({ example: 'datetime', description: 'Finished datetime' })
  @IsString()
  @IsNotEmpty()
  finished_at: string;
}
