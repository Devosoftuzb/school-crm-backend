import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateGroupDayDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: 1, description: 'Day ID' })
  @IsNotEmpty()
  @IsInt()
  day_id: number;
}
