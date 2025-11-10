import { Injectable } from '@nestjs/common';
import { BackendService } from '../backend/backend.service';

@Injectable()
export class AuthService {
  constructor(private readonly backendService: BackendService) {}

  async register(data: any) {
    return this.backendService.post('/api/v1/auth/register', data);
  }

  async login(data: any) {
    return this.backendService.post('/api/v1/auth/login', data);
  }

  async refresh(data: any) {
    return this.backendService.post('/api/v1/auth/refresh', data);
  }
}

