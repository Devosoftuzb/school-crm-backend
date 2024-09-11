import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GroupDayService } from './group_day.service';
import { CreateGroupDayDto } from './dto/create-group_day.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Group Day')
@Controller('group-day')
export class GroupDayController {
  constructor(private readonly groupDayService: GroupDayService) {}

  @ApiOperation({ summary: 'Group Day  create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() createGroupDayDto: CreateGroupDayDto) {
    return this.groupDayService.create(createGroupDayDto);
  }

  @ApiOperation({ summary: 'Group Day view all' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.groupDayService.findAll();
  }

  @ApiOperation({ summary: 'Group Day view by ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupDayService.findOne(+id);
  }

  @ApiOperation({ summary: 'Group Day remove by ID' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupDayService.remove(+id);
  }
}
