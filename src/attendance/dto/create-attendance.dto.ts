import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty } from "class-validator";

export class CreateAttendanceDto {
  @ApiProperty({ example: 'List', description: 'Attendance list' })
  @IsNotEmpty()
  list: any;
}
