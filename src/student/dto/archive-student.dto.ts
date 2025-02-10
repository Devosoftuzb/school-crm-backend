import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ArchiveStudentDto {
  @ApiProperty({ example: true, description: 'Student status' })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
