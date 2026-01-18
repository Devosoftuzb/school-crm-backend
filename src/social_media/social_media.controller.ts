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
import { SocialMediaService } from './social_media.service';
import { CreateSocialMediaDto } from './dto/create-social_media.dto';
import { UpdateSocialMediaDto } from './dto/update-social_media.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Social Media')
@Controller('social-media')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard, JwtAuthGuard)
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Version('1')
  @ApiOperation({ summary: 'SocialMedia create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createSocialMediaDto: CreateSocialMediaDto) {
    return this.socialMediaService.create(createSocialMediaDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'SocialMedia remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.socialMediaService.remove(+id, +school_id);
  }

  @Version('1')
  @ApiOperation({ summary: 'SocialMedia view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get('add/:school_id')
  findAdd(@Param('school_id') school_id: string) {
    return this.socialMediaService.findAdd(+school_id);
  }
}
