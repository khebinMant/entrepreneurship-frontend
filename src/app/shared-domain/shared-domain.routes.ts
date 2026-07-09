import type { Routes } from '@angular/router';
import { permissionGuard } from '../core/guards/permission.guard';
import { ADMIN_ROLES } from '../core/constants/app.constants';

export const sharedDomainRoutes: Routes = [
  {
    path: 'categories',
    canActivate: [permissionGuard([...ADMIN_ROLES])],
    loadComponent: () => import('./pages/categories/categories.component').then((m) => m.CategoriesComponent),
  },
  {
    path: 'catalogues',
    canActivate: [permissionGuard([...ADMIN_ROLES])],
    loadComponent: () => import('./pages/catalogue/catalogue.component').then((m) => m.CatalogueComponent),
  },
];
