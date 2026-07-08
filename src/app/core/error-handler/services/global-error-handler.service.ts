import { ErrorHandler, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('[GlobalErrorHandler]', error);
  }

  handle(error: unknown): void {
    console.error('[HTTP Error]', error);
  }
}
