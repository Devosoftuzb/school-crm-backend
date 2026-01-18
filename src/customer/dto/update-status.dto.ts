import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateStatusDto {
  @ApiProperty({ example: true, description: 'customer is student value' })
  @IsNotEmpty()
  is_student: boolean;

}
