import { PartialType } from '@nestjs/swagger';
import { CreateCustomerTestDto } from './create-customer_test.dto';

export class UpdateCustomerTestDto extends PartialType(CreateCustomerTestDto) {}
