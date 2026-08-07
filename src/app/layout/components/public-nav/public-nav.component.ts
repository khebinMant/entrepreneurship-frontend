import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { STORAGE_KEYS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, ThemeToggleComponent, ClickOutsideDirective],
  template: `
    <nav class="public-nav">
      <div class="public-nav__inner">
        <div class="public-nav__left">
          <button class="public-nav__hamburger" (click)="mobileOpen = !mobileOpen" [class.open]="mobileOpen" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
          <a class="public-nav__logo" routerLink="/">Emprendia</a>
        </div>

        <div class="public-nav__center" [class.open]="mobileOpen">
          <a class="public-nav__link" routerLink="/entrepreneurships" routerLinkActive="active" (click)="mobileOpen = false">Emprendimientos</a>
          <a class="public-nav__link" routerLink="/events" routerLinkActive="active" (click)="mobileOpen = false">Eventos</a>
          <div class="public-nav__mobile-theme">
            <app-theme-toggle />
          </div>
        </div>

        <div class="public-nav__right">
          <div class="public-nav__desktop-theme">
            <app-theme-toggle />
          </div>

          <ng-container *ngIf="authService.authState().isAuthenticated; else loginBtns">
            <div class="public-nav__user" appClickOutside (appClickOutside)="dropdownOpen.set(false)">
              <button class="public-nav__avatar" (click)="dropdownOpen.update(v => !v)">
                <img *ngIf="authService.authState().userImage; else defaultAvatar"
                     [src]="authService.authState().userImage"
                     alt="Avatar" class="public-nav__avatar-img" />
                <ng-template #defaultAvatar><i class="pi pi-user"></i></ng-template>
                <span class="public-nav__avatar-name">{{ authService.authState().username }}</span>
                <i class="pi pi-chevron-down" [class.open]="dropdownOpen()"></i>
              </button>
              <div class="public-nav__dropdown" *ngIf="dropdownOpen()">
                <a class="public-nav__dropdown-item" routerLink="/app/perfil" (click)="dropdownOpen.set(false)">
                  <i class="pi pi-user"></i> Mi Perfil
                </a>
                <a class="public-nav__dropdown-item" routerLink="/app/categories" (click)="dropdownOpen.set(false)" *ngIf="isAdmin">
                  <i class="pi pi-cog"></i> Configuración
                </a>
                <div class="public-nav__dropdown-divider"></div>
                <button class="public-nav__dropdown-item public-nav__dropdown-item--danger" (click)="logout(); dropdownOpen.set(false)">
                  <i class="pi pi-sign-out"></i> Cerrar Sesión
                </button>
              </div>
            </div>
          </ng-container>
          <ng-template #loginBtns>
            <a class="public-nav__btn public-nav__btn--outline" routerLink="/login">Ingresar</a>
            <a class="public-nav__btn public-nav__btn--primary" routerLink="/register">Registro</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .public-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      height: 64px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .public-nav__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      height: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }
    .public-nav__left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .public-nav__logo {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
    }
    .public-nav__center {
      display: flex;
      gap: var(--spacing-lg);
      flex: 1;
    }
    .public-nav__link {
      position: relative;
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: 500;
      padding: 4px 0;
      white-space: nowrap;
    }
    .public-nav__link::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 0;
      height: 2px;
      background: var(--color-primary);
      transition: width var(--transition-fast);
      border-radius: 1px;
    }
    .public-nav__link:hover::after, .public-nav__link.active::after {
      width: 100%;
    }
    .public-nav__link:hover, .public-nav__link.active {
      color: var(--color-primary);
    }
    .public-nav__right {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-left: auto;
    }
    .public-nav__btn {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .public-nav__btn--primary {
      background: var(--color-primary);
      color: #fff;
    }
    .public-nav__btn--primary:hover {
      background: var(--color-primary-dark);
    }
    .public-nav__btn--outline {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
    }
    .public-nav__btn--outline:hover {
      background: var(--color-surface-alt);
    }
    .public-nav__user {
      position: relative;
    }
    .public-nav__avatar {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 6px 12px;
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: border-color var(--transition-fast);
    }
    .public-nav__avatar-img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }
    .public-nav__avatar:hover {
      border-color: var(--color-primary);
    }
    .public-nav__avatar i:last-child {
      transition: transform var(--transition-fast);
    }
    .public-nav__avatar i:last-child.open {
      transform: rotate(180deg);
    }
    .public-nav__dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 200px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      overflow: hidden;
      z-index: 1001;
    }
    .public-nav__dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 10px 14px;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      text-decoration: none;
      cursor: pointer;
      transition: background var(--transition-fast);
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }
    .public-nav__dropdown-item:hover {
      background: var(--color-surface-alt);
    }
    .public-nav__dropdown-item--danger {
      color: var(--color-error);
    }
    .public-nav__dropdown-divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--spacing-xs) 0;
    }
    .public-nav__hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      width: 28px;
      height: 28px;
      position: relative;
    }
    .public-nav__hamburger span {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--color-text-primary);
      border-radius: 2px;
      transition: all var(--transition-fast);
      transform-origin: center;
    }
    .public-nav__hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .public-nav__hamburger.open span:nth-child(2) {
      opacity: 0;
    }
    .public-nav__hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    .public-nav__mobile-theme {
      display: none;
    }

    @media (max-width: 768px) {
      .public-nav__inner {
        padding: 0 var(--spacing-md);
        gap: var(--spacing-sm);
      }
      .public-nav__hamburger {
        display: flex;
      }
      .public-nav__desktop-theme {
        display: none;
      }
      .public-nav__center {
        display: none;
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        flex-direction: column;
        padding: var(--spacing-md);
        gap: var(--spacing-xs);
        box-shadow: 0 8px 16px rgba(0,0,0,0.08);
      }
      .public-nav__center.open {
        display: flex;
      }
      .public-nav__link {
        padding: 12px var(--spacing-sm);
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
      }
      .public-nav__link:hover, .public-nav__link.active {
        background: var(--color-primary-light);
      }
      .public-nav__link::after {
        display: none;
      }
      .public-nav__mobile-theme {
        display: flex;
        padding: 12px var(--spacing-sm);
        border-top: 1px solid var(--color-border);
        margin-top: var(--spacing-xs);
        align-items: center;
        justify-content: space-between;
      }
      .public-nav__btn {
        font-size: var(--font-size-xs);
        padding: 6px 10px;
      }
      .public-nav__avatar-name {
        display: none;
      }
      .public-nav__avatar {
        padding: 6px 8px;
      }
    }
  `],
})
export class PublicNavComponent {
  readonly authService = inject(AuthenticationService);
  private readonly directAuth = inject(DirectAuthService);
  private readonly toastService = inject(ToastService);
  mobileOpen = false;
  readonly dropdownOpen = signal(false);

  get isAdmin(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_ROLES);
      if (!raw) return false;
      const roles: string[] = JSON.parse(raw);
      return roles.includes('admin');
    } catch {
      return false;
    }
  }

  logout(): void {
    this.toastService.success('Sesión cerrada correctamente.');
    this.directAuth.logout();
  }
}
