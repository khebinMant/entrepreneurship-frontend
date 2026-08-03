import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeycloakService } from '../../../authentication/services/keycloak.service';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);
  const directAuth = inject(DirectAuthService);

  if (req.url.includes('/realms/')) {
    return next(req);
  }

  return from(keycloakService.getToken()).pipe(
    switchMap((token) => {
      if (token) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(cloned);
      }
      const storedToken = directAuth.getStoredToken();
      if (storedToken) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${storedToken}` },
        });
        return next(cloned);
      }
      return next(req);
    }),
  );
};
