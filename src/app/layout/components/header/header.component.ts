import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { SidebarStateService } from '../../../core/theme/sidebar-state.service';
import { SessionService } from '../../../core/session/session.service';
import { STORAGE_KEYS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf, ThemeToggleComponent, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly authService = inject(AuthenticationService);
  private readonly directAuth = inject(DirectAuthService);
  private readonly toastService = inject(ToastService);
  readonly sidebarState = inject(SidebarStateService);
  private readonly sessionService = inject(SessionService);
  readonly menuOpen = signal(false);

  readonly displayName = computed(() => {
    const full = [this.sessionService.firstName(), this.sessionService.lastName()]
      .map((x) => x.trim())
      .filter(Boolean)
      .join(' ');
    if (full) return full;
    const raw = this.authService.authState().username;
    if (!raw) return 'Usuario';
    const base = raw.includes('@') ? raw.split('@')[0] : raw;
    const parts = base.split(/[-_.]+/).filter(Boolean);
    if (parts.join('') === base) return base.charAt(0).toUpperCase() + base.slice(1);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  });

  readonly displayEmail = computed(() => {
    return this.authService.authState().email || this.authService.authState().username || '';
  });

  readonly roleLabel = computed(() => {
    const roles = this.authService.authState().roles;
    if (roles.some((r) => r === 'admin' || r === 'ADMIN' || r === 'default-roles-emprendia')) {
      return 'Administrador';
    }
    return 'Eventos y Emprendimiento';
  });

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

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  handleHamburgerClick(): void {
    if (window.innerWidth < 768) {
      this.sidebarState.toggleMobile();
    } else {
      this.sidebarState.toggle();
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.toastService.success('Sesión cerrada correctamente.');
    this.directAuth.logout();
  }
}
