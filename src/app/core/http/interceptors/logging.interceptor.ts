import type { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../../src/environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.production) {
    console.log(`[HTTP] ${req.method} ${req.urlWithParams}`);
  }
  return next(req);
};
