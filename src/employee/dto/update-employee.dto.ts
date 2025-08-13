import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import {
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Employee full name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: '=998901234567',
    description: 'Employee phone number',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'john', description: 'Employee login' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  login: string;

  @ApiProperty({ example: 'administrator, teacher', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 20, description: 'Employee salary' })
  salary: number;
}
