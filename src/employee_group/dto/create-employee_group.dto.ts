import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateEmployeeGroupDto {
  @ApiProperty({ example: 1, description: 'Employee ID' })
  @IsNotEmpty()
  @IsInt()
  employee_id: number;

  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;
}
