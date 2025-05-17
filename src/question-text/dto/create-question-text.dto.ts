import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateQuestionTextDto {
  @ApiProperty({ example: 'Title', description: 'Question text title' })
  title: string;

  @ApiProperty({ example: 'text', description: 'Question text' })
  text: string;
}
