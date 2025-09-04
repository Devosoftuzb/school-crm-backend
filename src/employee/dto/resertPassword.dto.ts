import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'New password', description: 'Employee password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak!"})
  new_password: string;
}
