import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Put,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/common/pipes/image-validation.pipe';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiOperation({ summary: 'Question create' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
  ) {
    return this.questionsService.create(createQuestionDto, file);
  }

  @ApiOperation({ summary: 'Question view all' })
  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @ApiOperation({ summary: 'User pagination' })
  @Get('page')
  paginate(@Query('page') page: number) {
    return this.questionsService.paginate(page);
  }

  @ApiOperation({ summary: 'Question view by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Question update by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
  ) {
    return this.questionsService.update(+id, updateQuestionDto, file);
  }

  @ApiOperation({ summary: 'Question remove by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }
}
