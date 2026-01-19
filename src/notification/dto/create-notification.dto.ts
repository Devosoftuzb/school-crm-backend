import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'info',
    description: 'Notification turi (info, warning, success va h.k)',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'Yangi xabar',
    description: 'Notification sarlavhasi',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Sizga yangi xabar keldi',
    description: 'Notification matni',
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}
