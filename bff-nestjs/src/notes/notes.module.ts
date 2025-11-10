import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { BackendModule } from '../backend/backend.module';

@Module({
  imports: [BackendModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}

