import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh a 7-day refresh token' })
  @ApiBody({ schema: { example: { refreshToken: 'your-refresh-token' } } })
  @ApiResponse({ status: 200, description: 'New tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body('refreshToken') refreshToken: string) { return this.authService.refresh(refreshToken); }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@Req() req: any) { return this.authService.logout(req.user.id); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Req() req: any) { return this.authService.getMe(req.user.id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admins')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create another admin account (admin only)' })
  @ApiBody({ schema: { example: { fullName: 'New Admin', email: 'admin2@octane.com', password: 'Admin@123', phone: '01000000000' } } })
  createAdmin(@Body() dto: { fullName: string; email: string; password: string; phone?: string }) { return this.authService.createAdmin(dto); }
}
