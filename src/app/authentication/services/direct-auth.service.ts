import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/authentication/services/authentication.service';
import { UserService } from '../../user/services/user.service';
import { KeycloakService } from './keycloak.service';
import { STORAGE_KEYS } from '../../core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class DirectAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly keycloakService = inject(KeycloakService);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(username: string, password: string): Promise<void> {
    const body = new URLSearchParams({
      client_id: environment.keycloak.clientId,
      username,
      password,
      grant_type: 'password',
    });

    const response: any = await lastValueFrom(
      this.http.post(
        `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`,
        body.toString(),
        { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
      ),
    );

    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);

    const tokenParsed = this.decodeToken(response.access_token);

    this.keycloakService.setTokens(response.access_token, response.refresh_token, tokenParsed);

    this.authService.setAuthenticated(
      tokenParsed.sub,
      tokenParsed.preferred_username,
      tokenParsed.realm_access?.roles ?? [],
    );

    await this.syncUser(tokenParsed, response.access_token);

    this.router.navigate(['/']);
  }

  async syncCurrentUser(): Promise<void> {
    const tokenParsed = this.keycloakService.tokenParsed;
    if (!tokenParsed?.sub) return;

    const keycloakId = tokenParsed.sub;
    const firstName = tokenParsed.given_name || tokenParsed.name || '';
    const lastName = tokenParsed.family_name || '';

    try {
      await lastValueFrom(this.userService.getByKeycloakId(keycloakId));
    } catch {
      await lastValueFrom(this.userService.create({ keycloakId, firstName, lastName, profilePictureUrl: null }));
    }

    this.authService.setAuthenticated(
      keycloakId,
      tokenParsed.preferred_username,
      tokenParsed.realm_access?.roles ?? [],
    );
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.authService.clearAuthentication();
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private async syncUser(tokenParsed: any, token: string): Promise<void> {
    const keycloakId = tokenParsed.sub;
    const firstName = tokenParsed.given_name || tokenParsed.name || '';
    const lastName = tokenParsed.family_name || '';

    try {
      await lastValueFrom(this.userService.getByKeycloakId(keycloakId));
    } catch {
      await lastValueFrom(this.userService.create({ keycloakId, firstName, lastName, profilePictureUrl: null }));
    }
  }

  getStoredToken(): string | null {
    return this.accessToken || localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  }
}
