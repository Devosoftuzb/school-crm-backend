import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Subject')
@Controller('subject')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @ApiOperation({ summary: 'Subject create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @ApiOperation({ summary: 'Subject view all by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @ApiOperation({ summary: 'Subject view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.subjectService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Subject paginate' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.subjectService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Subject view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.subjectService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Subject update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(+id, +school_id, updateSubjectDto);
  }

  @ApiOperation({ summary: 'Subject remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.subjectService.remove(+id, +school_id);
  }
}
