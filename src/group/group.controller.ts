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
  Version,
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
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard, JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Version('1')
  @ApiOperation({ summary: 'Create a new group' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'View all groups by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get('add/:school_id')
  findAdd(@Param('school_id') school_id: string) {
    return this.groupService.findAdd(+school_id);
  }

  // @ApiOperation({ summary: 'View all groups by school ID' })
  // @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  // @Get(':school_id')
  // findAll(@Param('school_id') school_id: string) {
  //   return this.groupService.findAll(+school_id);
  // }

  // @ApiOperation({ summary: 'View all groups by school ID' })
  // @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  // @Get(':school_id/find')
  // findBySchoolId(@Param('school_id') school_id: string) {
  //   return this.groupService.findBySchoolId(+school_id);
  // }

  @Version('1')
  @ApiOperation({ summary: 'Paginate groups by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/page')
  paginate(@Param('school_id') school_id: string, @Query('page') page: number) {
    return this.groupService.paginate(+school_id, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Paginate groups by school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('teacher/:school_id/:teacher_id/page')
  paginateTeacher(
    @Param('school_id') school_id: string,
    @Param('teacher_id') teacher_id: string,
    @Query('page') page: number,
  ) {
    return this.groupService.paginateTeacher(+school_id, +teacher_id, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'View a group by ID and school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get(':school_id/:id')
  findOne(@Param('school_id') school_id: string, @Param('id') id: string) {
    return this.groupService.findOne(+school_id, +id);
  }

  @Version('1')
  @ApiOperation({ summary: 'View a group by ID and school ID' })
  @Roles('owner', 'administrator', 'teacher')
  @Get('one-all/:school_id/:id')
  findOneAll(@Param('school_id') school_id: string, @Param('id') id: string) {
    return this.groupService.findOneAll(+school_id, +id);
  }

  // @ApiOperation({ summary: 'View a group by ID and school ID' })
  // @Roles('owner', 'administrator', 'teacher')
  // @Get(':school_id/:id/not')
  // findOneNotInclude(
  //   @Param('id') id: string,
  //   @Param('school_id') school_id: string,
  // ) {
  //   return this.groupService.findOneNotInclude(+id, +school_id);
  // }

  // @ApiOperation({ summary: 'View a group by ID and school ID' })
  // @Roles('owner', 'administrator', 'teacher')
  // @Get(':school_id/:id/student')
  // findOneStudent(
  //   @Param('id') id: string,
  //   @Param('school_id') school_id: string,
  // ) {
  //   return this.groupService.findOneStudent(+id, +school_id);
  // }

  // @ApiOperation({ summary: 'View a group by ID and school ID' })
  // @Roles('owner', 'administrator', 'teacher')
  // @Get(':school_id/:id/payment')
  // findOnePayment(
  //   @Param('id') id: string,
  //   @Param('school_id') school_id: string,
  // ) {
  //   return this.groupService.findOnePayment(+id, +school_id);
  // }

  // @ApiOperation({ summary: 'View a group by ID and school ID' })
  // @Roles('owner', 'administrator', 'teacher')
  // @Get(':school_id/:id/group')
  // findOneGroup(@Param('id') id: string, @Param('school_id') school_id: string) {
  //   return this.groupService.findOneGroup(+id, +school_id);
  // }

  @Version('1')
  @ApiOperation({ summary: 'Update a group by ID and school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('school_id') school_id: string,
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(+school_id, +id, updateGroupDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Remove a group by ID and school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.groupService.remove(+id, +school_id);
  }

  // @ApiOperation({ summary: 'View a employee by ID and school ID' })
  // @Roles('owner', 'administrator', 'teacher')
  // @Get('getEmployeeGroup/:school_id/:employee_id')
  // getEmployeeGroup(
  //   @Param('employee_id') employee_id: string,
  //   @Param('school_id') school_id: string,
  // ) {
  //   return this.groupService.getEmployeeGroup(+employee_id, +school_id);
  // }

  @Version('1')
  @ApiOperation({
    summary:
      'Get recommended groups based on test, writing, and overall levels',
  })
  @Roles('owner', 'administrator', 'teacher')
  @Get('level/:school_id/:overall')
  getGroupLevel(
    @Param('school_id') school_id: string,
    @Param('overall') overall: string,
  ) {
    return this.groupService.getGroupLevel(+school_id, overall);
  }

  @Version('1')
  @ApiOperation({ summary: 'View all groups by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get('teacher/:school_id/:teacher_id')
  findTeacherGroup(
    @Param('school_id') school_id: string,
    @Param('teacher_id') teacher_id: string,
  ) {
    return this.groupService.findTeacherGroup(+school_id, +teacher_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Search group by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search/:school_id/:name')
  searchName(
    @Param('school_id') school_id: string,
    @Param('name') name: string,
  ) {
    return this.groupService.searchName(+school_id, name);
  }
}
