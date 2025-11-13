import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class BackendService {
  private readonly backendUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_API_URL') || 'http://localhost:8080';
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      throw new HttpException(
        error.response.data || { message: 'Backend error' },
        error.response.status,
      );
    }
    throw new HttpException('Backend service unavailable', 503);
  }

  async post<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.backendUrl}${path}`, data, { 
          headers: headers || {} 
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async get<T>(path: string, headers?: Record<string, string>, params?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.backendUrl}${path}`, { 
          headers: headers || {},
          params: params || {}
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async put<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.backendUrl}${path}`, data, { 
          headers: headers || {} 
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.backendUrl}${path}`, { 
          headers: headers || {} 
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }
}
