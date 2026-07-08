import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from '../../authentication/services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly authService = inject(AuthenticationService);

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.authService.hasRole(role));
  }

  isAuthenticated(): boolean {
    return this.authService.authState().isAuthenticated;
  }
}
