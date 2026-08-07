import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideKeycloak } from 'keycloak-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor, errorInterceptor, loggingInterceptor } from './core';
import { GlobalErrorHandlerService } from './core/error-handler/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'disabled' }),
    ),
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor, errorInterceptor]),
    ),
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
      },
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
  ],
};
