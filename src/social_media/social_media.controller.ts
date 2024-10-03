import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { SocialMediaService } from './social_media.service';
import { CreateSocialMediaDto } from './dto/create-social_media.dto';
import { UpdateSocialMediaDto } from './dto/update-social_media.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Social Media')
@Controller('social-media')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @ApiOperation({ summary: 'SocialMedia create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createSocialMediaDto: CreateSocialMediaDto) {
    return this.socialMediaService.create(createSocialMediaDto);
  }

  @ApiOperation({ summary: 'SocialMedia view all by school ID' })
  @Roles('superadmin', 'admin')
  @Get()
  findAll() {
    return this.socialMediaService.findAll();
  }

  @ApiOperation({ summary: 'SocialMedia view all by school ID' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get(':school_id')
  findAllBySchoolId(@Param('school_id') school_id: string) {
    return this.socialMediaService.findAllBySchoolId(+school_id);
  }

  @ApiOperation({ summary: 'SocialMedia paginate' })
  @Roles('owner', 'administrator')
  @Get(':school_id/page')
  paginate(@Query('page') page: number, @Param('school_id') school_id: string) {
    return this.socialMediaService.paginate(+school_id, page);
  }

  @ApiOperation({ summary: 'SocialMedia view by ID by school ID' })
  @Roles('owner', 'administrator')
  @Get(':school_id/:id')
  findOne(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.socialMediaService.findOne(+id, +school_id);
  }

  @ApiOperation({ summary: 'SocialMedia update by ID by school ID' })
  @Roles('owner', 'administrator')
  @Put(':school_id/:id')
  update(
    @Param('id') id: string,
    @Param('school_id') school_id: string,
    @Body() updateSocialMediaDto: UpdateSocialMediaDto,
  ) {
    return this.socialMediaService.update(+id, +school_id, updateSocialMediaDto);
  }

  @ApiOperation({ summary: 'SocialMedia remove by ID by school ID' })
  @Roles('owner', 'administrator')
  @Delete(':school_id/:id')
  remove(@Param('id') id: string, @Param('school_id') school_id: string) {
    return this.socialMediaService.remove(+id, +school_id);
  }
}
