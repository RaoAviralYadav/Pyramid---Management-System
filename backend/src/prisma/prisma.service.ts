import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// A thin wrapper around PrismaClient that hooks into Nest's lifecycle so
// the connection opens/closes cleanly with the app instead of leaking.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// @Global() so every feature module can inject PrismaService without
// importing PrismaModule explicitly — it's infrastructure, not a feature.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
