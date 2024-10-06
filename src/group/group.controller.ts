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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Group')
@Controller('group')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({ summary: 'Create a new group' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @ApiOperation({ summary: 'View all groups by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.groupService.findAll();
  }
  

  @ApiOperation({ summary: 'View all groups by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.groupService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'View all groups by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id/find')
  findBySchoolId(@Param('school_id') school_id: string) {
    return this.groupService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'Paginate groups by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(
    @Query('page') page: number,
    @Param('school_id') school_id: string
  ) {
    return this.groupService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'View a group by ID and school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.groupService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'Update a group by ID and school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(+id, +school_id, updateGroupDto);
  }

  @ApiOperation({ summary: 'Remove a group by ID and school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(
    @Param('id') id: string, 
    @Param('school_id') school_id: string
  ) {
    return this.groupService.remove(+id, +school_id);
  }
}
