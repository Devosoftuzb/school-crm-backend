import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Old password', description: 'Employee password' })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({ example: 'New password', description: 'Employee password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
