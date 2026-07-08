import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { ROUTE_PATHS } from '../constants/app.constants';

export const permissionGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    const hasPermission = allowedRoles.some((role) => authService.hasRole(role));

    if (hasPermission) {
      return true;
    }

    return router.createUrlTree([ROUTE_PATHS.UNAUTHORIZED]);
  };
};
