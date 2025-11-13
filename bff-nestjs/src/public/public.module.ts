import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { BackendModule } from '../backend/backend.module';

@Module({
  imports: [BackendModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}

