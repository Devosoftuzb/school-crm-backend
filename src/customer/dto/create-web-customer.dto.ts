import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class CreateWebCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Customer phone number',
  })
  @Matches(/^\+998\d{9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number: string;

  @ApiProperty({ example: 1, description: 'Subject ID' })
  @IsNotEmpty()
  @IsInt()
  subject_id: number;

  @ApiProperty({ example: '14: 00 - 16: 00', description: 'Time' })
  @IsString()
  time: string;

  @ApiProperty({ example: 'John Doe', description: 'Teacher name' })
  @IsString()
  teacher_name: string;
}
