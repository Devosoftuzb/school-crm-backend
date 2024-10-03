import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/common/pipes/image-validation.pipe';

@ApiTags('School')
@Controller('school')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @ApiOperation({ summary: 'School create' })
  @Roles('superadmin', 'admin')
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  create(
    @Body() createSchoolDto: CreateSchoolDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.schoolService.create(createSchoolDto, image);
  }

  @ApiOperation({ summary: 'School view all' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.schoolService.findAll();
  }

  @ApiOperation({ summary: 'User pagination' })
  @Roles('superadmin', 'admin')
  @Get('page')
  paginate(@Query('page') page: number) {
    return this.schoolService.paginate(page);
  }

  @ApiOperation({ summary: 'School view by ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(+id);
  }

  @ApiOperation({ summary: 'School update by ID' })
  @Roles('superadmin', 'admin', 'owner')
  @UseInterceptors(FileInterceptor('image'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.schoolService.update(+id, updateSchoolDto, image);
  }

  @ApiOperation({ summary: 'School remove by ID' })
  @Roles('superadmin', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolService.remove(+id);
  }
}
