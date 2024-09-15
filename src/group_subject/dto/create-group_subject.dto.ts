import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupSubjectDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: "Backend", description: 'Subject name' })
  @IsNotEmpty()
  @IsString()
  subject_name: string;
}
