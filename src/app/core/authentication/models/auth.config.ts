import { InjectionToken } from '@angular/core';

export interface KeycloakConfig {
  issuer: string;
  realm: string;
  clientId: string;
}

export const KEYCLOAK_CONFIG = new InjectionToken<KeycloakConfig>('KEYCLOAK_CONFIG');
