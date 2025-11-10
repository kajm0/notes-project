import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BackendService {
  private readonly backendUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_API_URL') || 'http://localhost:8080';
  }

  async post<T>(path: string, data: any, headers?: any): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.backendUrl}${path}`, data, { headers }),
    );
    return response.data;
  }

  async get<T>(path: string, headers?: any, params?: any): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.backendUrl}${path}`, { headers, params }),
    );
    return response.data;
  }

  async put<T>(path: string, data: any, headers?: any): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.put(`${this.backendUrl}${path}`, data, { headers }),
    );
    return response.data;
  }

  async delete<T>(path: string, headers?: any): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.backendUrl}${path}`, { headers }),
    );
    return response.data;
  }
}

