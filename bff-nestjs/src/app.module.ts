import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { ShareModule } from './share/share.module';
import { BackendModule } from './backend/backend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 1000,
      max: 10,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    BackendModule,
    AuthModule,
    NotesModule,
    ShareModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

