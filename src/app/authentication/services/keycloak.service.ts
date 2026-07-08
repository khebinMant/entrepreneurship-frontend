import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private readonly keycloak = inject(Keycloak);

  get tokenParsed(): any {
    return this.keycloak.tokenParsed;
  }

  get authenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  async getToken(): Promise<string> {
    try {
      await this.keycloak.updateToken(5);
    } catch {
      // Token refresh failed
    }
    return this.keycloak.token ?? '';
  }

  setTokens(accessToken: string, refreshToken: string, tokenParsed: any): void {
    (this.keycloak as any).token = accessToken;
    (this.keycloak as any).refreshToken = refreshToken;
    (this.keycloak as any).tokenParsed = tokenParsed;
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin + '/app/dashboard' });
  }

  register(): void {
    this.keycloak.register({ redirectUri: window.location.origin + '/app/dashboard' });
  }

  loginWithGoogle(): void {
    this.keycloak.login({ idpHint: 'google' });
  }

  loginWithFacebook(): void {
    this.keycloak.login({ idpHint: 'facebook' });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
