import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSchoolDto {
    @ApiProperty({example: 'Devosoft', description: 'School name'})
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({example: '4 mkr Yoshlar markazi', description: 'School address'})
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({example: 'Logo', description: 'School logo'})
    image: any;


    @ApiProperty({example: 1, description: 'School owner ID'})
    // @IsInt()
    @IsNotEmpty()
    owner_id: number;
}
