import { Injectable } from '@nestjs/common';
import { BackendService } from '../backend/backend.service';

@Injectable()
export class PublicService {
  constructor(private readonly backendService: BackendService) {}

  async getPublicNote(token: string) {
    // Les notes publiques n'ont pas besoin d'authentification
    return this.backendService.get(`/api/v1/p/${token}`);
  }
}


