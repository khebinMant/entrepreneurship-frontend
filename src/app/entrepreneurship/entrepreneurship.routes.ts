import type { Routes } from '@angular/router';
import { authGuard } from '../core/authentication/guards/auth.guard';

export const entrepreneurshipRoutes: Routes = [
  {
    path: 'entrepreneurships',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/create/create.component').then((m) => m.CreateComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/detail/detail.component').then((m) => m.DetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/edit/edit.component').then((m) => m.EditComponent),
      },
    ],
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
];
