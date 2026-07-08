import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard__hero">
        <h1 class="dashboard__title">
          Bienvenido, {{ authService.authState().username }}
        </h1>
        <p class="dashboard__subtitle">
          Gestiona tus emprendimientos, organiza eventos y mucho más.
        </p>
      </div>

      <div class="dashboard__cards">
        <a class="dashboard__card" routerLink="/app/entrepreneurships">
          <div class="dashboard__card-icon" style="background: var(--color-primary-light); color: var(--color-primary);">
            <i class="pi pi-briefcase"></i>
          </div>
          <h3 class="dashboard__card-title">Emprendimientos</h3>
          <p class="dashboard__card-desc">Administra tus negocios y publica portales públicos.</p>
        </a>

        <a class="dashboard__card" routerLink="/app/events">
          <div class="dashboard__card-icon" style="background: #eef2ff; color: var(--color-primary);">
            <i class="pi pi-calendar"></i>
          </div>
          <h3 class="dashboard__card-title">Eventos</h3>
          <p class="dashboard__card-desc">Organiza ferias y gestiona invitaciones.</p>
        </a>

        <a class="dashboard__card" routerLink="/app/catalogues">
          <div class="dashboard__card-icon" style="background: #f0fdf4; color: #16a34a;">
            <i class="pi pi-th-large"></i>
          </div>
          <h3 class="dashboard__card-title">Catálogos</h3>
          <p class="dashboard__card-desc">Configura tipos y valores de catálogo.</p>
        </a>

        <a class="dashboard__card" routerLink="/app/profile">
          <div class="dashboard__card-icon" style="background: #fef2f2; color: #dc2626;">
            <i class="pi pi-user"></i>
          </div>
          <h3 class="dashboard__card-title">Mi Perfil</h3>
          <p class="dashboard__card-desc">Actualiza tu información personal.</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: var(--spacing-xxl);
      max-width: 960px;
      margin: 0 auto;
    }
    .dashboard__hero {
      margin-bottom: var(--spacing-xxl);
    }
    .dashboard__title {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }
    .dashboard__subtitle {
      color: var(--color-text-secondary);
      margin: var(--spacing-sm) 0 0;
      font-size: var(--font-size-md);
    }
    .dashboard__cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--spacing-md);
    }
    .dashboard__card {
      padding: var(--spacing-lg);
      text-decoration: none;
      transition: all var(--transition-fast);
      position: relative;
    }
    .dashboard__card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--color-primary-light);
      border-radius: 2px;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
    .dashboard__card:hover::before {
      opacity: 1;
    }
    .dashboard__card:hover {
      background: var(--color-surface-alt);
    }
    .dashboard__card-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-bottom: var(--spacing-sm);
    }
    .dashboard__card-title {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs);
    }
    .dashboard__card-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
    }
  `],
})
export class DashboardComponent {
  readonly authService = inject(AuthenticationService);
}
