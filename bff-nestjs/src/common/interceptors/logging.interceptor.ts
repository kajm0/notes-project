import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const authHeader = headers.authorization || 'NO AUTH';

    this.logger.debug(`[${method}] ${url} - Auth: ${authHeader.substring(0, 30)}...`);

    return next.handle().pipe(
      tap(() => {
        this.logger.debug(`[${method}] ${url} - Completed`);
      }),
    );
  }
}

