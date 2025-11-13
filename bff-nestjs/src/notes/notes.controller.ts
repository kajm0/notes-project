import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { NotesService } from './notes.service';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('api/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes with filters' })
  async getNotes(
    @Query() query: any,
    @Headers('authorization') auth: string,
  ) {
    return this.notesService.getNotes(query, auth);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  async getNoteById(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.notesService.getNoteById(id, auth);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create new note' })
  async createNote(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.notesService.createNote(body, auth);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update note' })
  async updateNote(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.notesService.updateNote(id, body, auth);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note' })
  async deleteNote(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.notesService.deleteNote(id, auth);
  }
}


