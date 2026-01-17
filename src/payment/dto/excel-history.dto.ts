// dto/excel-day-history.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExcelHistoryDto {
  @ApiPropertyOptional()
  year?: number;

  @ApiPropertyOptional()
  month?: number;

  @ApiPropertyOptional()
  day?: number;

  @ApiPropertyOptional()
  group_id?: number;

  @ApiPropertyOptional()
  employee_id?: number;
}
