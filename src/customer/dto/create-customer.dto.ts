import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: '+998901234567', description: 'Customer phone number' })
  @IsPhoneNumber(undefined)
  phone_number: string;

  @ApiProperty({ example: 1, description: 'Social Media ID' })
  @IsNotEmpty()
  @IsInt()
  social_media_id: number;

  @ApiProperty({ example: 1, description: 'Subject ID' })
  @IsNotEmpty()
  @IsInt()
  subject_id: number;

  @ApiProperty({ example: 'Description', description: 'Customer description' })
  description: string;
}
