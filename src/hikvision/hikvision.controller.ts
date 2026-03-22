import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  Logger,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HikvisionService } from './hikvision.service';

@ApiTags('Hikvision')
@Controller('hikvision')
export class HikvisionController {
  private readonly logger = new Logger(HikvisionController.name);

  constructor(private readonly hikvisionService: HikvisionService) {}

  @Version('1')
  @ApiOperation({ summary: 'Check device connection' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'superadmin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('ping')
  ping() {
    return this.hikvisionService.ping();
  }

  @Version('1')
  @ApiOperation({ summary: 'Add student face to device' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Student yuz rasmi (jpg/png)',
        },
      },
      required: ['photo'],
    },
  })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'superadmin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Post('face/:student_id')
  @UseInterceptors(FileInterceptor('photo'))
  addFace(
    @Param('student_id') student_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hikvisionService.addFace(+student_id, file);
  }

  @Version('1')
  @ApiOperation({ summary: 'Delete student face from device' })
  @ApiBearerAuth('access-token')
  @Roles('owner', 'administrator', 'superadmin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete('face/:student_id')
  deleteFace(@Param('student_id') student_id: string) {
    return this.hikvisionService.deleteFace(+student_id);
  }
}
