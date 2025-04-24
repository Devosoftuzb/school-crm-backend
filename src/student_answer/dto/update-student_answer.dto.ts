import { PartialType } from '@nestjs/swagger';
import { CreateStudentAnswerDto } from './create-student_answer.dto';

export class UpdateStudentAnswerDto extends PartialType(CreateStudentAnswerDto) {}
