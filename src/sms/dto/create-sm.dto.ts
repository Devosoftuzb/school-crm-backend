import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateSmsPaymentDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: 'September', description: 'Month' })
  @IsString()
  month: string;
}

export class CreateSmsDevDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;
}

export class CreateSmsAttendanceDto {
  @ApiProperty({ example: '+998901234567', description: 'Sms phone number' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ example: 'text', description: 'Sms text' })
  @IsString()
  text: string;
}
