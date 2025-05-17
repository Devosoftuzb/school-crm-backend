import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Question text create' })
    @UseGuards(RolesGuard, JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Roles('superadmin', 'admin', 'owner', 'administrator')
    @Post()
    create(@Body() createQuestionTextDto: CreateQuestionTextDto) {
      return this.questionTextService.create(createQuestionTextDto);
    }
  
    @ApiOperation({ summary: 'Question text view all' })
    @Get()
    findAll() {
      return this.questionTextService.findAll();
    }
  
    @ApiOperation({ summary: 'Question text view by ID' })
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.questionTextService.findOne(+id);
    }
  
    @ApiOperation({ summary: 'Question text remove by ID' })
    @UseGuards(RolesGuard, JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Roles('owner', 'administrator')
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.questionTextService.remove(+id);
    }
}
