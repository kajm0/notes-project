import { Body, Controller, Delete, Headers, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShareService } from './share.service';

@ApiTags('share')
@ApiBearerAuth()
@Controller('api/notes')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post(':noteId/share/user')
  @ApiOperation({ summary: 'Share note with user' })
  async shareWithUser(
    @Param('noteId') noteId: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.shareService.shareWithUser(noteId, body, auth);
  }

  @Post(':noteId/share/public')
  @ApiOperation({ summary: 'Create public link' })
  async createPublicLink(
    @Param('noteId') noteId: string,
    @Headers('authorization') auth: string,
  ) {
    return this.shareService.createPublicLink(noteId, auth);
  }

  @Delete('shares/:shareId')
  @ApiOperation({ summary: 'Revoke share' })
  async revokeShare(
    @Param('shareId') shareId: string,
    @Headers('authorization') auth: string,
  ) {
    return this.shareService.revokeShare(shareId, auth);
  }

  @Delete('public-links/:linkId')
  @ApiOperation({ summary: 'Revoke public link' })
  async revokePublicLink(
    @Param('linkId') linkId: string,
    @Headers('authorization') auth: string,
  ) {
    return this.shareService.revokePublicLink(linkId, auth);
  }
}

