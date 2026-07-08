import type { Routes } from '@angular/router';
import { isNotAuthenticatedGuard } from './guards/auth.guard';

export const authenticationRoutes: Routes = [
  {
    path: 'login',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'logout',
    loadComponent: () => import('./pages/logout/logout.component').then((m) => m.LogoutComponent),
  },
];
