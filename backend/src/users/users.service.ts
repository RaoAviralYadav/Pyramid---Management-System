import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdatePreferencesDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    // Used to populate "Members" / assignee pickers across the app.
    return this.prisma.user.findMany({
      select: { id: true, fullName: true, username: true, avatarUrl: true, title: true },
      orderBy: { fullName: 'asc' },
    });
  }

  updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  updatePreferences(id: string, dto: UpdatePreferencesDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  // This starter models a single shared workspace, so "leaving" a real
  // account just signs it out; a guest account is deleted outright since
  // it has no lasting identity to keep around. A multi-workspace version
  // would instead delete a WorkspaceMembership row here.
  async leaveWorkspace(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user?.isGuest) {
      await this.prisma.user.delete({ where: { id } });
      return { left: true, deleted: true };
    }
    return { left: true, deleted: false };
  }
}
