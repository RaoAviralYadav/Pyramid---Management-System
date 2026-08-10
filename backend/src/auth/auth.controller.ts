import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  guestLogin() {
    return this.authService.createGuestSession();
  }

  // Kicks off the Google OAuth handshake — the guard redirects to Google.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Intentionally empty: AuthGuard('google') handles the redirect.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken } = await this.authService.loginWithGoogleProfile(req.user as any);
    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0];
    res.redirect(`${frontendUrl}/login/callback?token=${accessToken}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }
}
