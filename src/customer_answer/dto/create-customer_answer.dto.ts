import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerAnswerDto {
  @ApiProperty({ example: 'Array customer answer' , description: 'Customer answer'})
  list: any;
}
