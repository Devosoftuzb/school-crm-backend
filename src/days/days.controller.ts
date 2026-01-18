import {
  Controller,
  Get,
  UseGuards,
  Version,
} from '@nestjs/common';
import { DaysService } from './days.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Days')
@Controller('days')
export class DaysController {
  constructor(private readonly daysService: DaysService) {}

  @Version('1')
  @ApiOperation({ summary: 'Days view all' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  findAll() {
    return this.daysService.findAll();
  }
}
