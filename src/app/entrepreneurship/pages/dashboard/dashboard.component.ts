import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { SessionService } from '../../../core/session/session.service';
import { greetName as buildGreetName } from '../../../shared/utils/greeting';
import { APP_ROLE } from '../../../core/constants/app.constants';

interface QuickAction {
  label: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard__hero">
        <div class="dashboard__hero-bg"></div>
        <div class="dashboard__hero-content">
          <span class="dashboard__eyebrow"><i class="pi pi-bolt"></i> Centro de control</span>
          <h1 class="dashboard__title">Hola {{ greetName() }} 👋</h1>
          <p class="dashboard__subtitle">
            Gestiona tus eventos, emprendimientos, invitaciones y portales desde un solo lugar.
          </p>
          <div class="dashboard__hero-actions">
            <a class="btn btn--hero" routerLink="/app/events/create">
              <i class="pi pi-calendar-plus"></i> Crear Evento
            </a>
            <a class="btn btn--hero btn--hero-ghost" routerLink="/app/entrepreneurships/create">
              <i class="pi pi-plus"></i> Crear Emprendimiento
            </a>
          </div>
        </div>
      </div>

      <div class="dashboard__section">
        <div class="dashboard__section-head">
          <h2 class="dashboard__section-title">Accesos rápidos</h2>
          <span class="dashboard__section-hint">Tu panel administrativo a un clic</span>
        </div>
        <div class="dashboard__grid">
          @for (action of quickActions(); track action.label) {
            <a class="dashboard__tile" [routerLink]="action.route">
              <div class="dashboard__tile-icon" [style.background]="action.color + '1f'" [style.color]="action.color">
                <i class="{{ action.icon }}"></i>
              </div>
              <div class="dashboard__tile-info">
                <h3 class="dashboard__tile-title">{{ action.label }}</h3>
                <p class="dashboard__tile-desc">{{ action.description }}</p>
              </div>
              <i class="pi pi-arrow-right dashboard__tile-arrow"></i>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1024px;
      margin: 0 auto;
    }

    .dashboard__hero {
      position: relative;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%);
      border-radius: 28px;
      padding: var(--spacing-xxl);
      margin-bottom: var(--spacing-xxl);
      overflow: hidden;
      box-shadow: 0 24px 60px -24px rgba(124, 58, 237, 0.55);
    }

    .dashboard__hero-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 12% 20%, rgba(255,255,255,0.18) 0, transparent 38%),
        radial-gradient(circle at 88% 82%, rgba(255,255,255,0.14) 0, transparent 42%);
      pointer-events: none;
    }

    .dashboard__hero-content {
      position: relative;
      z-index: 1;
    }

    .dashboard__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--spacing-md);
      backdrop-filter: blur(8px);
    }

    .dashboard__title {
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 800;
      color: #fff;
      margin: 0 0 var(--spacing-sm);
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .dashboard__subtitle {
      color: rgba(255,255,255,0.88);
      margin: 0 0 var(--spacing-lg);
      font-size: var(--font-size-md);
      max-width: 520px;
      line-height: 1.55;
    }

    .dashboard__hero-actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .btn--hero {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      border-radius: 999px;
      border: none;
      background: #fff;
      color: #4f46e5;
      font-weight: 700;
      font-size: var(--font-size-sm);
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 10px 24px -10px rgba(0,0,0,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn--hero:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -10px rgba(0,0,0,0.4);
    }

    .btn--hero-ghost {
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      backdrop-filter: blur(8px);
    }

    .dashboard__section-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      flex-wrap: wrap;
    }

    .dashboard__section-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }

    .dashboard__section-hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .dashboard__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--spacing-md);
    }

    .dashboard__tile {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      text-decoration: none;
      transition: all 0.25s ease;
      position: relative;
    }

    .dashboard__tile:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 40px -18px color-mix(in srgb, var(--color-text-primary) 30%, transparent);
      border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
    }

    .dashboard__tile-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .dashboard__tile-info {
      min-width: 0;
      flex: 1;
    }

    .dashboard__tile-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 2px;
    }

    .dashboard__tile-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .dashboard__tile-arrow {
      color: var(--color-text-muted);
      font-size: 14px;
      opacity: 0;
      transform: translateX(-6px);
      transition: all 0.25s ease;
      flex-shrink: 0;
    }

    .dashboard__tile:hover .dashboard__tile-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    @media (max-width: 767px) {
      .dashboard__hero {
        padding: var(--spacing-lg);
        border-radius: 20px;
      }
      .dashboard__grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  readonly authService = inject(AuthenticationService);
  private readonly sessionService = inject(SessionService);

  readonly greetName = computed(() =>
    buildGreetName(
      this.sessionService.firstName(),
      this.sessionService.lastName(),
      this.authService.authState().username,
    ),
  );

  readonly isAdmin = computed(() => this.authService.hasRole(APP_ROLE.ADMIN) || this.authService.hasRole(APP_ROLE.ADMIN_KEYCLOAK));

  readonly quickActions = computed<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      { label: 'Panel de Control', description: 'Métricas y estadísticas de tu plataforma.', route: '/app/dashboard', icon: 'pi pi-chart-pie', color: '#4f46e5' },
      { label: 'Mis Eventos', description: 'Crea, edita y gestiona tus eventos.', route: '/app/events', icon: 'pi pi-calendar', color: '#db2777' },
      { label: 'Invitaciones', description: 'Invita emprendimientos y revisa el estado.', route: '/app/invitations', icon: 'pi pi-envelope', color: '#0891b2' },
      { label: 'Mis Emprendimientos', description: 'Administra tus negocios y sus portales.', route: '/app/entrepreneurships', icon: 'pi pi-briefcase', color: '#16a34a' },
      { label: 'Mi Perfil', description: 'Actualiza tu información personal.', route: '/app/profile', icon: 'pi pi-user', color: '#f59e0b' },
    ];
    if (this.isAdmin()) {
      actions.push(
        { label: 'Categorías', description: 'Administra las categorías del sistema.', route: '/app/categories', icon: 'pi pi-tags', color: '#9333ea' },
        { label: 'Variables del Sistema', description: 'Configura tipos y valores del sistema.', route: '/app/catalogues', icon: 'pi pi-th-large', color: '#0ea5e9' },
      );
    }
    return actions;
  });
}
