import type { Routes } from '@angular/router';
import { authGuard } from '../core/authentication/guards/auth.guard';

export const eventRoutes: Routes = [
  {
    path: 'events',
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
      {
        path: ':id/invitations',
        loadComponent: () => import('./pages/invitations/invitations.component').then((m) => m.InvitationsComponent),
      },
    ],
  },
];
