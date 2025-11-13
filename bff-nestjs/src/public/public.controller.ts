import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('api/p')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get public note by token' })
  async getPublicNote(@Param('token') token: string) {
    return this.publicService.getPublicNote(token);
  }
}

