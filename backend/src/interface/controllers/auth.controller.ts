import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { LoginDto } from '../dtos/auth.dto.js';
import { AuthService } from '../../service/auth.service.js';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login to the system' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.validateAndLogin(body);

    const secure = this.configService.get<boolean>('cookie.secure');
    const sameSite = this.configService.get<'lax' | 'strict' | 'none'>('cookie.sameSite');
    const domain = this.configService.get<string>('cookie.domain');

    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return { message: 'Login successful', user: result.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout from the system' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req: any) {
    return req.user;
  }
}
