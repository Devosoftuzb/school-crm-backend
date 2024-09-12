import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSocialMediaDto {
    @ApiProperty({ example: 1, description: 'School ID' })
    @IsNotEmpty()
    @IsInt()
    school_id: number;
  
    @ApiProperty({ example: 'Telegram', description: 'Social name' })
    @IsString()
    name: string;
}
