import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateSmsPaymentDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  // @ApiProperty({ example: 'September', description: 'Month' })
  // @IsString()
  // month: string;
}

export class CreateSmsDevDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;
}

export class CreateSmsAttendanceDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNotEmpty()
  student_id: number;
}
