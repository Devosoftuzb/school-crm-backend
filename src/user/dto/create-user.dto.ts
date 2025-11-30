import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '=998901234567', description: 'User phone number' })
  @IsPhoneNumber(undefined)
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'john', description: 'User login' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  login: string;

  @ApiProperty({ example: 'password', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'owner, admin, superadmin', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
