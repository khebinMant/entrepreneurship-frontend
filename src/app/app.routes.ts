import type { Routes } from '@angular/router';
import { isNotAuthenticatedGuard } from './authentication/guards/auth.guard';
import { authGuard } from './core/authentication/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { ADMIN_ROLES } from './core/constants/app.constants';
import { userRoutes } from './user/user.routes';
import { entrepreneurshipRoutes } from './entrepreneurship/entrepreneurship.routes';
import { eventRoutes } from './event/event.routes';
import { sharedDomainRoutes } from './shared-domain/shared-domain.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/components/public-shell/public-shell.component').then((m) => m.PublicShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./layout/pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        canActivate: [isNotAuthenticatedGuard],
        loadComponent: () => import('./layout/pages/login-redirect/login-redirect.component').then((m) => m.LoginRedirectComponent),
      },
      {
        path: 'register',
        canActivate: [isNotAuthenticatedGuard],
        loadComponent: () => import('./layout/pages/login-redirect/login-redirect.component').then((m) => m.LoginRedirectComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./layout/pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'events',
        loadComponent: () => import('./event/pages/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./event/pages/public-detail/public-detail.component').then((m) => m.PublicDetailComponent),
      },
      {
        path: 'entrepreneurships',
        loadComponent: () => import('./entrepreneurship/pages/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: 'entrepreneurships/:id',
        loadComponent: () => import('./entrepreneurship/pages/public-detail/public-detail.component').then((m) => m.PublicDetailComponent),
      },
      {
        path: 'invitations/:id/accept',
        loadComponent: () => import('./event/pages/invitation-respond/invitation-respond.component').then((m) => m.InvitationRespondComponent),
      },
      {
        path: 'invitations/:id/reject',
        loadComponent: () => import('./event/pages/invitation-respond/invitation-respond.component').then((m) => m.InvitationRespondComponent),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/components/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
      {
        path: 'perfil',
        loadComponent: () => import('./entrepreneurship/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./entrepreneurship/pages/dashboard-metrics/dashboard-metrics.component').then((m) => m.DashboardMetricsComponent),
      },
      {
        path: 'categories',
        canActivate: [permissionGuard([...ADMIN_ROLES])],
        loadComponent: () => import('./shared-domain/pages/categories/categories.component').then((m) => m.CategoriesComponent),
      },
      { path: 'invitations', loadComponent: () => import('./event/pages/invitations/invitations.component').then((m) => m.InvitationsComponent) },
      ...userRoutes,
      ...entrepreneurshipRoutes,
      ...eventRoutes,
      ...sharedDomainRoutes,
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./layout/pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./layout/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
