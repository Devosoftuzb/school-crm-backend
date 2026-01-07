import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Parents full name' })
  @IsString()
  parents_full_name: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Parents phone number',
  })
  @Matches(/^\+998\d{9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  parents_phone_number: string;

  @ApiProperty({ example: 'John Doe', description: 'Student full name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Student phone number',
  })
  @Matches(/^\+998\d{9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: true, description: 'Student status' })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @ApiProperty({ example: '15-10-2025', description: 'Student start date' })
  @IsString()
  @IsNotEmpty()
  start_date: string;
}
