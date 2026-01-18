import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeeSubjectDto {
  @ApiProperty({ example: 1, description: 'Employee ID' })
  @IsNotEmpty()
  @IsInt()
  employee_id: number;

  @ApiProperty({ example: 1, description: 'Subject ID' })
  @IsNotEmpty()
  @IsInt()
  subject_id: number;
}
