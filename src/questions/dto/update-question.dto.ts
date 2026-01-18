import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
import { UpdateOptionDto } from 'src/option/dto/update-option.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiPropertyOptional({
    type: [UpdateOptionDto],
    description: 'Question options (update or new)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOptionDto)
  options?: UpdateOptionDto[];
}
