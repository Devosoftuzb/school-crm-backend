import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
  UseInterceptors,
  UploadedFile,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/common/pipes/image-validation.pipe';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Version('1')
  @ApiOperation({ summary: 'Notification create' })
  @Roles('superadmin', 'admin')
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  create(
    @Body() dto: CreateNotificationDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.notificationService.create(dto, image);
  }

  @Version('1')
  @ApiOperation({ summary: 'Notification view all' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Version('1')
  @ApiOperation({ summary: 'User pagination' })
  @Roles('superadmin', 'admin', 'owner', 'administrator', 'teacher')
  @Get('page')
  paginate(@Query('page') page: number) {
    return this.notificationService.paginate(page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Notification view by ID' })
  @Roles('superadmin', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Notification remove by ID' })
  @Roles('superadmin', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
