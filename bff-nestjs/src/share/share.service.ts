import { Injectable } from '@nestjs/common';
import { BackendService } from '../backend/backend.service';

@Injectable()
export class ShareService {
  constructor(private readonly backendService: BackendService) {}

  async shareWithUser(noteId: string, data: any, auth: string) {
    return this.backendService.post(`/api/v1/notes/${noteId}/share/user`, data, { Authorization: auth });
  }

  async createPublicLink(noteId: string, auth: string) {
    return this.backendService.post(`/api/v1/notes/${noteId}/share/public`, {}, { Authorization: auth });
  }

  async revokeShare(shareId: string, auth: string) {
    return this.backendService.delete(`/api/v1/notes/shares/${shareId}`, { Authorization: auth });
  }

  async revokePublicLink(linkId: string, auth: string) {
    return this.backendService.delete(`/api/v1/notes/public-links/${linkId}`, { Authorization: auth });
  }
}

