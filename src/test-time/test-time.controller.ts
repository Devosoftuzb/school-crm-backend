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
import { TestTimeService } from './test-time.service';
import { TestTimeDto } from './dto/test-time.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('test-times')
@Controller('test-time')
export class TestTimeController {
  constructor(private readonly testTimeService: TestTimeService) {}

  @ApiOperation({ summary: 'add to list a test time' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() testTimeDto: TestTimeDto) {
    return this.testTimeService.create(testTimeDto);
  }

  @ApiOperation({ summary: 'get all test times' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.testTimeService.findAll();
  }

  @ApiOperation({ summary: 'get test times by student and test-goup id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('find/:id1/:id2')
  findById(@Param('id1') id1: string, @Param('id2') id2: number) {
    return this.testTimeService.findById(id1, id2);
  }

  @ApiOperation({ summary: 'get test times by student id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('student/:id')
  findByStudentId(@Param('id') id: string) {
    return this.testTimeService.findByStudentId(id);
  }

  @ApiOperation({ summary: 'get test time by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.testTimeService.findOne(id);
  }

  @ApiOperation({ summary: 'update test time by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() testTimeDto: TestTimeDto) {
    return this.testTimeService.update(id, testTimeDto);
  }

  @ApiOperation({ summary: 'delete test time by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.testTimeService.remove(id);
  }
}
