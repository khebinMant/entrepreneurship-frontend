import { Injectable, signal, inject, effect } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { lastValueFrom } from 'rxjs';
import { KeycloakService } from '../../../authentication/services/keycloak.service';
import { UserService } from '../../../user/services/user.service';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  keycloakId: string | null;
  roles: string[];
  username: string | null;
  userImage: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  keycloakId: null,
  roles: [],
  username: null,
  userImage: null,
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly state = signal<AuthState>(initialState);
  private readonly keycloakService = inject(KeycloakService);
  private readonly userService = inject(UserService);

  readonly authState = this.state.asReadonly();

  private readonly keycloakEventSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    effect(() => {
      const event = this.keycloakEventSignal();
      if (event.type === KeycloakEventType.AuthSuccess) {
        this.onAuthSuccess();
      } else if (event.type === KeycloakEventType.AuthLogout) {
        this.onLogout();
      }
    });
  }

  initFromKeycloak(): void {
    const tokenParsed = this.keycloakService.tokenParsed;
    if (tokenParsed) {
      const keycloakId = tokenParsed.sub;
      const username = tokenParsed.preferred_username;
      const roles = tokenParsed.realm_access?.roles ?? [];
      this.setAuthenticated(keycloakId, username, roles);
    }
  }

  setAuthenticated(keycloakId: string, username: string, roles: string[], userImage: string | null = null): void {
    this.state.set({ isAuthenticated: true, userId: keycloakId, keycloakId, username, roles, userImage });
  }

  setUserImage(imageUrl: string | null): void {
    this.state.update((s) => ({ ...s, userImage: imageUrl }));
  }

  clearAuthentication(): void {
    this.state.set(initialState);
  }

  hasRole(role: string): boolean {
    return this.state().roles.includes(role);
  }

  private async onAuthSuccess(): Promise<void> {
    this.initFromKeycloak();
    const tokenParsed = this.keycloakService.tokenParsed;
    if (tokenParsed?.sub) {
      const keycloakId = tokenParsed.sub;
      const firstName = tokenParsed.given_name || tokenParsed.name || '';
      const lastName = tokenParsed.family_name || '';
      try {
        const user = await lastValueFrom(this.userService.getByKeycloakId(keycloakId));
        if (user.imageUrl) {
          this.setUserImage(user.imageUrl);
        }
      } catch {
        await lastValueFrom(this.userService.create({ keycloakId, firstName, lastName }));
      }
    }
  }

  private onLogout(): void {
    this.clearAuthentication();
  }
}
