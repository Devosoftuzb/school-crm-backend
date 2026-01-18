import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Version('1')
  @ApiOperation({ summary: 'Test create' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  // @ApiOperation({ summary: 'Test view all by school ID' })
  // @Get('getSchoolId/:school_id')
  // findAll(@Param('school_id') school_id: string) {
  //   return this.testService.findAll(+school_id);
  // }

  @Version('1')
  @ApiOperation({ summary: 'Test paginate' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id/page')
  paginate(@Param('school_id') school_id: string, @Query('page') page: number) {
    return this.testService.paginate(+school_id, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Test view by ID' })
  @Get('not/:id')
  findOneNot(@Param('id') id: string) {
    return this.testService.findOneNot(+id);
  }


  // @ApiOperation({ summary: 'Test view by ID' })
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.testService.findOne(+id);
  // }

  @Version('1')
  @ApiOperation({ summary: 'Test update by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testService.update(+id, updateTestDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Test remove by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testService.remove(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Search test by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search/:school_id/:name')
  searchName(
    @Param('school_id') school_id: string,
    @Param('name') name: string,
  ) {
    return this.testService.searchName(+school_id, name);
  }
}
