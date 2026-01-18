import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Version,
} from '@nestjs/common';
import { StudentGroupService } from './student_group.service';
import { CreateStudentGroupDto } from './dto/create-student_group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Student Group')
@Controller('student-group')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StudentGroupController {
  constructor(private readonly studentGroupService: StudentGroupService) {}

  @Version('1')
  @ApiOperation({ summary: 'Student Group create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Post()
  create(@Body() createStudentGroupDto: CreateStudentGroupDto) {
    return this.studentGroupService.create(createStudentGroupDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student Group view by ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentGroupService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Student Group remove by ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentGroupService.remove(+id);
  }
}
