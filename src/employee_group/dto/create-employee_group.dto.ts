import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeeGroupDto {
  @ApiProperty({ example: 1, description: 'Employee ID' })
  @IsNotEmpty()
  @IsInt()
  employee_id: number;

  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: "Backend", description: 'Group name' })
  @IsNotEmpty()
  @IsString()
  group_name: string;
}
