import {
  Controller,
  Post,
  Res,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CookieGetter } from 'src/common/decorators/cookieGetter.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { login, password } = loginDto;
    return this.authService.login(login, password, res);
  }

  @ApiOperation({ summary: 'User logout' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CookieGetter('refresh_token') refreshToken: string,
    @Body('userId') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(refreshToken, userId, res);
    return { message: 'Successfully logged out.' };
  }

  @ApiOperation({ summary: 'User refresh token generate' })
  @Post('refresh')
  async refreshToken(@Body() body: any, @Res() res: Response) {
    const { userId, refreshToken } = body;
    const tokens = await this.authService.refreshToken(
      userId,
      refreshToken,
      res,
    );
    return { access_token: tokens.access_token };
  }
}
