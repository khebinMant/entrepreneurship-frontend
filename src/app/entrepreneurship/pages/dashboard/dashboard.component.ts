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
        <div class="dashboard__hero-bg"></div>
        <div class="dashboard__hero-content">
          <h1 class="dashboard__title">Panel de Control</h1>
          <p class="dashboard__subtitle">
            Bienvenido de nuevo, {{ authService.authState().username }}. Aquí tienes un resumen de tu plataforma.
          </p>
        </div>
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
          <div class="dashboard__card-icon" style="background: var(--color-primary-light); color: var(--color-primary);">
            <i class="pi pi-calendar"></i>
          </div>
          <h3 class="dashboard__card-title">Eventos</h3>
          <p class="dashboard__card-desc">Organiza ferias y gestiona invitaciones.</p>
        </a>

        <a class="dashboard__card" routerLink="/app/catalogues">
          <div class="dashboard__card-icon" style="background: var(--color-primary-light); color: var(--color-primary);">
            <i class="pi pi-th-large"></i>
          </div>
          <h3 class="dashboard__card-title">Variables del Sistema</h3>
          <p class="dashboard__card-desc">Configura tipos y valores de variables del sistema.</p>
        </a>

        <a class="dashboard__card" routerLink="/app/profile">
          <div class="dashboard__card-icon" style="background: var(--color-primary-light); color: var(--color-primary);">
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
      max-width: 960px;
      margin: 0 auto;
    }
    .dashboard__hero {
      position: relative;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-light) 100%);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xxl);
      margin-bottom: var(--spacing-xxl);
      overflow: hidden;
    }
    @media (max-width: 767px) {
      .dashboard__hero { padding: var(--spacing-lg); border-radius: var(--radius-lg); }
      .dashboard__title { font-size: var(--font-size-xl); }
      .dashboard__subtitle { font-size: var(--font-size-sm); }
      .dashboard__cards { grid-template-columns: 1fr; }
    }
    .dashboard__hero-content {
      position: relative;
      z-index: 1;
    }
    .dashboard__title {
      font-size: var(--font-size-xxl);
      font-weight: 800;
      color: #fff;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .dashboard__subtitle {
      color: rgba(255,255,255,0.85);
      margin: var(--spacing-sm) 0 0;
      font-size: var(--font-size-md);
    }
    .dashboard__cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--spacing-md);
    }
    .dashboard__card {
      display: flex;
      flex-direction: column;
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
    }
    .dashboard__card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
      border-color: transparent;
    }
    .dashboard__card-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-bottom: var(--spacing-md);
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
      line-height: 1.5;
    }
  `],
})
export class DashboardComponent {
  readonly authService = inject(AuthenticationService);
}
