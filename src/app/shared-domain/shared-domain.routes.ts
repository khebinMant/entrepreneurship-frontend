import type { Routes } from '@angular/router';

export const sharedDomainRoutes: Routes = [
  {
    path: 'catalogues',
    loadComponent: () => import('./pages/catalogue/catalogue.component').then((m) => m.CatalogueComponent),
  },
];
