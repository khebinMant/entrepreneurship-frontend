import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GlobalErrorHandlerService } from '../../error-handler/services/global-error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(GlobalErrorHandlerService);

  return next(req).pipe(
    catchError((error) => {
      errorHandler.handle(error);
      return throwError(() => error);
    }),
  );
};
