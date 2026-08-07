import { Injectable, signal, inject } from '@angular/core';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  exiting: boolean;
}

export interface LoggedToast {
  id: number;
  type: ToastType;
  message: string;
  at: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly authService = inject(AuthenticationService);
  private readonly toastsSignal = signal<Toast[]>([]);
  private readonly logSignal = signal<LoggedToast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();
  readonly log = this.logSignal.asReadonly();

  success(message: string, duration = 3200): void {
    this.show({ type: 'success', message, duration }, true);
  }

  error(message: string, duration = 4800): void {
    this.show({ type: 'error', message, duration }, false);
  }

  info(message: string, duration = 3200): void {
    this.show({ type: 'info', message, duration }, true);
  }

  warning(message: string, duration = 3800): void {
    this.show({ type: 'warning', message, duration }, true);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }

  clearLog(): void {
    this.logSignal.set([]);
  }

  private show(toast: Omit<Toast, 'id' | 'exiting'>, requiresAuth: boolean): void {
    if (requiresAuth && !this.authService.authState().isAuthenticated) {
      return;
    }
    const id = this.nextId++;
    this.toastsSignal.update((list) => [...list, { ...toast, id, exiting: false }]);

    const at = Date.now();
    this.logSignal.update((list) => [{ ...toast, id, at }, ...list].slice(0, 50));

    setTimeout(() => this.beginExit(id), toast.duration);
  }

  private beginExit(id: number): void {
    this.toastsSignal.update((list) =>
      list.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => this.dismiss(id), 320);
  }
}