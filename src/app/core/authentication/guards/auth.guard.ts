import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ROUTE_PATHS } from '../../constants/app.constants';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.authState().isAuthenticated) {
    return true;
  }

  return router.createUrlTree([ROUTE_PATHS.AUTH.LOGIN]);
};
