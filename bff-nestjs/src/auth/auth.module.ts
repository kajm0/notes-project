import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BackendModule } from '../backend/backend.module';

@Module({
  imports: [BackendModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}


