import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty } from "class-validator";

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsNotEmpty()
  @IsInt()
  school_id: number;

  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNotEmpty()
  @IsInt()
  student_id: number;

  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: true, description: 'Attendance status' })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
