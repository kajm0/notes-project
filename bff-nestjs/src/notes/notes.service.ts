import { Injectable } from '@nestjs/common';
import { BackendService } from '../backend/backend.service';

@Injectable()
export class NotesService {
  constructor(private readonly backendService: BackendService) {}

  async getNotes(query: any, auth: string) {
    return this.backendService.get('/api/v1/notes', { Authorization: auth }, query);
  }

  async getNoteById(id: string, auth: string) {
    return this.backendService.get(`/api/v1/notes/${id}`, { Authorization: auth });
  }

  async createNote(data: any, auth: string) {
    return this.backendService.post('/api/v1/notes', data, { Authorization: auth });
  }

  async updateNote(id: string, data: any, auth: string) {
    return this.backendService.put(`/api/v1/notes/${id}`, data, { Authorization: auth });
  }

  async deleteNote(id: string, auth: string) {
    return this.backendService.delete(`/api/v1/notes/${id}`, { Authorization: auth });
  }
}

