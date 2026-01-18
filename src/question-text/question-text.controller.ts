import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  Version,
} from '@nestjs/common';
import { QuestionTextService } from './question-text.service';
import { CreateQuestionTextDto } from './dto/create-question-text.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Question Text')
@Controller('question-text')
export class QuestionTextController {
  constructor(private readonly questionTextService: QuestionTextService) {}

  @Version('1')
  @ApiOperation({ summary: 'Question text create' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createQuestionTextDto: CreateQuestionTextDto) {
    return this.questionTextService.create(createQuestionTextDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Question text view all' })
  @Get('getTestId/:test_id')
  findAll(@Param('test_id') test_id: string) {
    return this.questionTextService.findAll(+test_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Question text remove by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionTextService.remove(+id);
  }
}
