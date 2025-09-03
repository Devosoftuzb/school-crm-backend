import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';


export class CreateCostCategoryDto {
  @ApiProperty({ example: 1, description: 'School ID' })
  @IsInt()
  @IsNotEmpty()
  school_id: number;

  @ApiProperty({ example: 'Suv uchun', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
