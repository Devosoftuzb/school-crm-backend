import { PartialType } from '@nestjs/swagger';
import { CreateCustomerAnswerDto } from './create-customer_answer.dto';

export class UpdateCustomerAnswerDto extends PartialType(CreateCustomerAnswerDto) {}
