import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSubjectDto {
    @ApiProperty({ example: 1, description: 'School ID' })
    @IsNotEmpty()
    @IsInt()
    school_id: number;
  
    @ApiProperty({ example: 'English', description: 'Subject name' })
    @IsString()
    name: string;
}
