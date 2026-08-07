import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { SidebarStateService } from '../../../core/theme/sidebar-state.service';
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
  readonly menuOpen = signal(false);

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
