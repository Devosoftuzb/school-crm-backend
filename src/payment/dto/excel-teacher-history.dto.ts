// dto/excel-day-history.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExcelTeacherHistoryDto {
  @ApiPropertyOptional()
  year?: number;

  @ApiPropertyOptional()
  month?: number;

  @ApiPropertyOptional()
  day?: number;

  @ApiPropertyOptional()
  employee_id?: number;
}
