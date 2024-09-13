import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TestSubmitService } from './test-submit.service';
import { TestSubmitDto } from './dto/test-submit.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('test-submits')
@Controller('test-submit')
export class TestSubmitController {
  constructor(private readonly testSubmitService: TestSubmitService) {}

  @ApiOperation({ summary: 'create a new test submit' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() testSubmitDto: TestSubmitDto) {
    return this.testSubmitService.create(testSubmitDto);
  }

  @ApiOperation({ summary: 'get all test submits' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.testSubmitService.findAll();
  }

  @ApiOperation({ summary: 'get test submits by student and test-goup id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('find/:id1/:id2')
  findById(@Param('id1') id1: string, @Param('id2') id2: number) {
    return this.testSubmitService.findById(id1, id2);
  }

  @ApiOperation({ summary: 'get test submit by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('student/:id')
  findByStudentId(@Param('id') id: string) {
    return this.testSubmitService.findByStudentId(id);
  }

  @ApiOperation({ summary: 'get test submit by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.testSubmitService.findOne(id);
  }

  @ApiOperation({ summary: 'update test submit' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() testSubmitDto: TestSubmitDto) {
    return this.testSubmitService.update(id, testSubmitDto);
  }

  @ApiOperation({ summary: 'delete test submit' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.testSubmitService.remove(id);
  }
}
