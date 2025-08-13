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

  @ApiOperation({ summary: 'Test create' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @ApiOperation({ summary: 'Test view all by school ID' })
  @Get('getSchoolId/:school_id')
  findAll(@Param('school_id') school_id: string) {
    return this.testService.findAll(+school_id);
  }

  @ApiOperation({ summary: 'Test paginate' })
  @Get(':school_id/page')
  paginate(@Param('school_id') school_id: string, @Query('page') page: number) {
    return this.testService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'Test view by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testService.findOne(+id);
  }

  @ApiOperation({ summary: 'Test update by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testService.update(+id, updateTestDto);
  }

  @ApiOperation({ summary: 'Test remove by ID' })
  @UseGuards(RolesGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testService.remove(+id);
  }
}
