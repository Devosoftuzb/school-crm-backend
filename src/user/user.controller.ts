import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Version('1')
  @ApiOperation({ summary: 'User create' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.create(createUserDto, res);
  }

  @Version('1')
  @ApiOperation({ summary: 'User view all' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('add/:role')
  findAll(@Param('role') role: string,) {
    return this.userService.findAll(role);
  }

  @Version('1')
  @ApiOperation({ summary: 'User pagination' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get(':role/page')
  paginate(@Param('role') role: string, @Query('page') page: number) {
    return this.userService.paginate(role, page);
  }

  @Version('1')
  @ApiOperation({ summary: 'User view by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'User update by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUpdateDto: UpdateUserDto) {
    return this.userService.update(+id, updateUpdateDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'User delete by ID' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Change password user' })
  @Post('change-password/:id')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(+id, changePasswordDto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Search user by name' })
  @ApiBearerAuth('access-token')
  @Roles('superadmin', 'admin')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get('search/:role/:name')
  searchName(@Param('role') role: string, @Param('name') name: string) {
    return this.userService.searchName(role, name);
  }
}
