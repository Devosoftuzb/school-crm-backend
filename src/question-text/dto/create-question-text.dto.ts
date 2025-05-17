import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateQuestionTextDto {
  @ApiProperty({ example: 'text', description: 'Question text' })
  text: string;
}
