import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Room')
@Controller('room')
@UseGuards(RolesGuard, JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Version('1')
  @ApiOperation({ summary: 'Room create' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Room view all' })
  @Roles('superadmin', 'admin', 'owner', 'administrator')
  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Version('1')
  @ApiOperation({ summary: 'Room pagination' })
  @Roles('owner', 'administrator')
  @Get('page')
  paginate(@Query('page') page: number) {
    return this.roomService.paginate(page);
  }

  @Version('1')
  @ApiOperation({ summary: 'Room view by ID' })
  @Roles('owner', 'administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Room update by ID' })
  @Roles('owner', 'administrator')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Room remove by ID' })
  @Roles('owner', 'administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
