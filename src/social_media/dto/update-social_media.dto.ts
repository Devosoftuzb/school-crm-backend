import { PartialType } from '@nestjs/swagger';
import { CreateSocialMediaDto } from './create-social_media.dto';

export class UpdateSocialMediaDto extends PartialType(CreateSocialMediaDto) {}
