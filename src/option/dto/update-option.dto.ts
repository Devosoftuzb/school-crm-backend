import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateOptionDto {
  @ApiPropertyOptional({ example: 1, description: 'Option ID (update uchun)' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ example: 'go', description: 'Option text' })
  @IsString()
  @IsNotEmpty()
  option: string;

  @ApiPropertyOptional({ example: true, description: 'Correct or not' })
  @IsBoolean()
  is_correct: boolean;
}
