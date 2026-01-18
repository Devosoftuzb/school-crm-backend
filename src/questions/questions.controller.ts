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
  Version,
  BadRequestException,
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

  @Version('1')
  @ApiOperation({ summary: 'Question create' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() body: any,
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
  ) {
    body.test_id = Number(body.test_id);
    body.text_id = body.text_id ? Number(body.text_id) : null;
    if (body.options && typeof body.options === 'string') {
      body.options = JSON.parse(body.options);
    }
    return this.questionsService.create(body, file);
  }

  @Version('1')
  @ApiOperation({ summary: 'Question view all' })
  @Get('all/:test_id')
  findAll(@Param('test_id') test_id: string) {
    return this.questionsService.findAll(+test_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Question view by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Question update' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
  ) {
    body.test_id = Number(body.test_id);
    body.text_id = body.text_id ? Number(body.text_id) : null;

    if (body.options && typeof body.options === 'string') {
      try {
        body.options = JSON.parse(body.options);
      } catch (err) {
        throw new BadRequestException('Options format not valid');
      }
    }

    return this.questionsService.update(id, body, file);
  }

  @Version('1')
  @ApiOperation({ summary: 'Question remove by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }
}
