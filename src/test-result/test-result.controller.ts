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
import { TestResultService } from './test-result.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestResultDto } from './dto/test-result.dto';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('test-results')
@Controller('test-result')
export class TestResultController {
  constructor(private readonly testResultService: TestResultService) {}

  @ApiOperation({ summary: 'create a new test result' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post()
  create(@Body() testResultDto: TestResultDto) {
    return this.testResultService.create(testResultDto);
  }

  @ApiOperation({ summary: 'get all test results' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.testResultService.findAll();
  }

  @ApiOperation({ summary: 'get test result by student id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('studentId/:id')
  findByStudentId(@Param('id') id: string) {
    return this.testResultService.findByStudentId(id);
  }

  @ApiOperation({ summary: 'get test result by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.testResultService.findOne(id);
  }

  @ApiOperation({ summary: 'update test result by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() testResultDto: TestResultDto) {
    return this.testResultService.update(id, testResultDto);
  }

  @ApiOperation({ summary: 'delete test result by id' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.testResultService.remove(id);
  }
}
