import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateStudentGroupDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNotEmpty()
  @IsInt()
  student_id: number;
  
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;
}
