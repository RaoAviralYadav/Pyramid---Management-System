import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

// NOTE: this registers fine with placeholder values so the app boots
// without Google credentials configured (guest login doesn't need them).
// Hitting GET /api/auth/google will fail until real GOOGLE_CLIENT_ID /
// GOOGLE_CLIENT_SECRET are set in .env — see .env.example.
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { id, emails, displayName, photos } = profile;
    done(null, {
      googleId: id,
      email: emails?.[0]?.value,
      fullName: displayName,
      avatarUrl: photos?.[0]?.value,
    });
  }
}
