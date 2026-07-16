import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ROUTE_PATHS } from '../../constants/app.constants';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.authState().isAuthenticated) {
    return true;
  }

  const tree = router.createUrlTree([ROUTE_PATHS.AUTH.LOGIN], {
    queryParams: { redirect: state.url },
  });
  return tree;
};
