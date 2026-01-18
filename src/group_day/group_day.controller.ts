import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Version } from '@nestjs/common';
import { GroupDayService } from './group_day.service';
import { CreateGroupDayDto } from './dto/create-group_day.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Group Day')
@Controller('group-day')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GroupDayController {
  constructor(private readonly groupDayService: GroupDayService) {}

  @Version('1')
  @ApiOperation({ summary: 'Group Day  create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createGroupDayDto: CreateGroupDayDto) {
    return this.groupDayService.create(createGroupDayDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Group Day view all' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get()
  findAll() {
    return this.groupDayService.findAll();
  }

  @Version('1')
  @ApiOperation({ summary: 'Group Day view by ID' })
  @Roles('owner', 'administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupDayService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Group Day remove by ID' })
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupDayService.remove(+id);
  }
}
