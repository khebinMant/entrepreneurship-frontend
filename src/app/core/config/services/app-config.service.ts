import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  get sharedUrl(): string {
    return environment.services.shared;
  }

  get userUrl(): string {
    return environment.services.user;
  }

  get entrepreneurshipUrl(): string {
    return environment.services.entrepreneurship;
  }

  get eventUrl(): string {
    return environment.services.event;
  }

  get keycloakConfig() {
    return environment.keycloak;
  }

  isFeatureEnabled(feature: keyof typeof environment.features): boolean {
    return environment.features[feature];
  }

  isProduction(): boolean {
    return environment.production;
  }
}
