import { Injectable, signal, inject, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { lastValueFrom, fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KeycloakService } from '../../authentication/services/keycloak.service';
import { UserService } from '../../user/services/user.service';
import type { User } from '../../user/models/user';

export const SESSION_STORAGE_KEY = 'emprendia_session';

export interface SessionState {
  userId: number | null;
  keycloakId: string | null;
  username: string | null;
  roles: string[];
  userImage: string | null;
  firstName: string;
  lastName: string;
}

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly keycloakService = inject(KeycloakService);
  private readonly userService = inject(UserService);
  private readonly document = inject(DOCUMENT);
  private readonly keycloakEventSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  readonly ready = signal(false);
  readonly userId = signal<number | null>(null);
  readonly keycloakId = signal<string | null>(null);
  readonly username = signal<string | null>(null);
  readonly roles = signal<string[]>([]);
  readonly userImage = signal<string | null>(null);
  readonly firstName = signal('');
  readonly lastName = signal('');

  readonly isAuthenticated = signal(false);
  readonly loading = signal(true);

  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private activitySubscription: Subscription | null = null;

  constructor() {
    effect(() => {
      const event = this.keycloakEventSignal();
      if (event.type === KeycloakEventType.AuthSuccess) {
        this.onKeycloakAuthSuccess();
      } else if (event.type === KeycloakEventType.AuthLogout) {
        this.clear();
      }
    });
  }

  private async onKeycloakAuthSuccess(): Promise<void> {
    const tokenParsed = this.keycloakService.tokenParsed;
    if (!tokenParsed?.sub) return;

    const keycloakId = tokenParsed.sub;
    const username = tokenParsed.preferred_username ?? '';
    const roles = tokenParsed.realm_access?.roles ?? [];

    this.keycloakId.set(keycloakId);
    this.username.set(username);
    this.roles.set(roles);
    this.isAuthenticated.set(true);
    this.firstName.set(tokenParsed.given_name || tokenParsed.name || '');
    this.lastName.set(tokenParsed.family_name || '');

    const restored = this.restoreFromStorage();
    if (restored && restored.userId && restored.keycloakId === keycloakId) {
      this.userId.set(restored.userId);
      this.firstName.set(restored.firstName || this.firstName());
      this.lastName.set(restored.lastName || this.lastName());
      this.userImage.set(restored.userImage ?? null);
    } else {
      try {
        const user: User = await lastValueFrom(this.userService.getByKeycloakId(keycloakId));
        this.userId.set(user.userId);
        this.firstName.set(user.firstName);
        this.lastName.set(user.lastName);
        this.userImage.set(user.imageUrl ?? null);
      } catch {
        // User not found in backend, will be created by AuthenticationService
      }
    }

    this.persistToStorage();
    this.startInactivityTimer();
    this.loading.set(false);
    this.ready.set(true);
  }

  async initialize(): Promise<void> {
    this.loading.set(true);

    const restored = this.restoreFromStorage();
    const tokenParsed = this.keycloakService.tokenParsed;

    if (tokenParsed?.sub) {
      const keycloakId = tokenParsed.sub;
      this.keycloakId.set(keycloakId);
      this.username.set(tokenParsed.preferred_username ?? restored?.username ?? null);
      this.roles.set(tokenParsed.realm_access?.roles ?? restored?.roles ?? []);
      this.isAuthenticated.set(true);
      this.firstName.set(tokenParsed.given_name || tokenParsed.name || restored?.firstName || '');
      this.lastName.set(tokenParsed.family_name || restored?.lastName || '');

      if (restored && restored.userId && restored.keycloakId === keycloakId) {
        this.userId.set(restored.userId);
        this.userImage.set(restored.userImage ?? null);
      } else {
        await this.fetchAndSetUser(keycloakId);
      }

      this.persistToStorage();
      this.startInactivityTimer();
    } else if (restored) {
      this.keycloakId.set(restored.keycloakId);
      this.userId.set(restored.userId);
      this.username.set(restored.username);
      this.roles.set(restored.roles);
      this.firstName.set(restored.firstName);
      this.lastName.set(restored.lastName);
      this.userImage.set(restored.userImage ?? null);
      this.isAuthenticated.set(true);
    }

    this.loading.set(false);
    this.ready.set(true);
  }

  private async fetchAndSetUser(keycloakId: string): Promise<void> {
    try {
      const user: User = await lastValueFrom(this.userService.getByKeycloakId(keycloakId));
      this.userId.set(user.userId);
      this.firstName.set(user.firstName);
      this.lastName.set(user.lastName);
      this.userImage.set(user.imageUrl ?? null);
    } catch {
      this.clear();
    }
  }

  setUserImage(imageUrl: string | null): void {
    this.userImage.set(imageUrl);
    this.persistToStorage();
  }

  clear(): void {
    this.userId.set(null);
    this.keycloakId.set(null);
    this.username.set(null);
    this.roles.set([]);
    this.userImage.set(null);
    this.firstName.set('');
    this.lastName.set('');
    this.isAuthenticated.set(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.stopInactivityTimer();
  }

  private persistToStorage(): void {
    const data: SessionState = {
      userId: this.userId(),
      keycloakId: this.keycloakId(),
      username: this.username(),
      roles: this.roles(),
      userImage: this.userImage(),
      firstName: this.firstName(),
      lastName: this.lastName(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  }

  private restoreFromStorage(): SessionState | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SessionState) : null;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();

    this.activitySubscription = fromEvent(this.document, 'click', { capture: true })
      .pipe(debounceTime(500))
      .subscribe(() => this.resetInactivityTimer());

    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.keycloakService.logout();
      this.clear();
    }, INACTIVITY_TIMEOUT_MS);
  }

  private stopInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    this.activitySubscription?.unsubscribe();
    this.activitySubscription = null;
  }
}
