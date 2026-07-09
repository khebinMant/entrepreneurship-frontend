import { Injectable, inject, signal, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 10 * 1000;

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly router = inject(Router);
  private readonly directAuth = inject(DirectAuthService);
  private readonly ngZone = inject(NgZone);

  private timeoutMs = DEFAULT_TIMEOUT_MS;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastActivity = Date.now();

  readonly sessionExpired = signal(false);

  configure(timeoutMinutes: number): void {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
  }

  startTracking(): void {
    this.lastActivity = Date.now();
    this.sessionExpired.set(false);

    ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach((event) => {
      window.addEventListener(event, () => {
        this.lastActivity = Date.now();
      });
    });

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        const elapsed = Date.now() - this.lastActivity;
        if (elapsed >= this.timeoutMs) {
          this.ngZone.run(() => {
            this.handleTimeout();
          });
        }
      }, CHECK_INTERVAL_MS);
    });
  }

  stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  dismissModal(): void {
    this.sessionExpired.set(false);
    this.directAuth.logout();
    this.router.navigate(['/login']);
  }

  private handleTimeout(): void {
    this.stopTracking();
    this.sessionExpired.set(true);
  }
}
