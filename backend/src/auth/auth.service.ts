import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private sign(userId: string) {
    return this.jwt.sign({ sub: userId });
  }

  // "Continue as Guest" — spins up a throwaway user with no email, so
  // anyone can explore the app with zero setup.
  async createGuestSession() {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const user = await this.prisma.user.create({
      data: {
        isGuest: true,
        fullName: 'Guest',
        username: `guest${suffix}`,
        // Some MongoDB setups may still have a legacy unique index on googleId.
        // Store a unique guest marker here so multiple guest accounts can be created.
        googleId: `guest-${Date.now()}-${suffix}`,
      },
    });
    return { accessToken: this.sign(user.id), user };
  }

  // "Login with Google" — called after GoogleStrategy.validate() resolves
  // the OAuth profile. Links to an existing account by googleId first,
  // then by email (in case someone signed up as a guest and later verifies
  // via Google), otherwise creates a fresh account.
  // Uses findFirst rather than findUnique here: email/googleId aren't
  // @unique in the schema (see the note in schema.prisma on why — MongoDB
  // can't sparse-index them through Prisma), so findUnique isn't valid on
  // them. This app's scale doesn't need DB-enforced uniqueness on top of
  // this lookup-before-create check.
  async loginWithGoogleProfile(profile: GoogleProfile) {
    let user = await this.prisma.user.findFirst({ where: { googleId: profile.googleId } });

    if (!user && profile.email) {
      user = await this.prisma.user.findFirst({ where: { email: profile.email } });
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          isGuest: false,
          username: profile.email?.split('@')[0] ?? `user${Date.now()}`,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId, isGuest: false },
      });
    }

    return { accessToken: this.sign(user.id), user };
  }

  validateUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
