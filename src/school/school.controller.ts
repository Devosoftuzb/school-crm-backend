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
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @ApiOperation({ summary: 'School create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  create(
    @Body() createSchoolDto: CreateSchoolDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.schoolService.create(createSchoolDto, image);
  }

  @ApiOperation({ summary: 'School view all' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.schoolService.findAll();
  }

  @ApiOperation({ summary: 'User pagination' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('page')
  paginate(@Query('page') page: number) {
    return this.schoolService.paginate(page);
  }

  @ApiOperation({ summary: 'School view by ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(+id);
  }

  @ApiOperation({ summary: 'School update by ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner')
  @UseGuards(RolesGuard, JwtAuthGuard)
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
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolService.remove(+id);
  }
}
