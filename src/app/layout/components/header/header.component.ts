import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { SidebarStateService } from '../../../core/theme/sidebar-state.service';

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
  readonly sidebarState = inject(SidebarStateService);
  readonly menuOpen = signal(false);

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
    this.directAuth.logout();
  }
}
