import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateGroupSubjectDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: 1, description: 'Subject ID' })
  @IsNotEmpty()
  @IsInt()
  subject_id: number;
}
