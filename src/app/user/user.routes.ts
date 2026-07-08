import type { Routes } from '@angular/router';
import { authGuard } from '../core/authentication/guards/auth.guard';

export const userRoutes: Routes = [
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-list/user-list.component').then((m) => m.UserListComponent),
  },
];
