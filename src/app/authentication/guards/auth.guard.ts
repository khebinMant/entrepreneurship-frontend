import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../../core/authentication/services/authentication.service';
import { ROUTE_PATHS } from '../../core/constants/app.constants';

export const isNotAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authService.authState().isAuthenticated) {
    return true;
  }

  return router.createUrlTree([ROUTE_PATHS.ENTREPRENEURSHIP.DASHBOARD]);
};
