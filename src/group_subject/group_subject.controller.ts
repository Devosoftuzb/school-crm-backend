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
import { GroupSubjectService } from './group_subject.service';
import { CreateGroupSubjectDto } from './dto/create-group_subject.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Group Subject')
@Controller('group-subject')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GroupSubjectController {
  constructor(private readonly groupSubjectService: GroupSubjectService) {}

  @Version('1')
  @ApiOperation({ summary: 'Group Subject  create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createGroupSubjectDto: CreateGroupSubjectDto) {
    return this.groupSubjectService.create(createGroupSubjectDto);
  }

    @Version('1')
  @ApiOperation({ summary: 'Group Subject view by ID' })
  @Roles('owner', 'administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupSubjectService.findOne(+id);
  }

    @Version('1')
  @ApiOperation({ summary: 'Group Subject remove by ID' })
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupSubjectService.remove(+id);
  }
}
