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

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly authService = inject(AuthenticationService);
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, duration = 2600): void {
    this.show({ type: 'success', message, duration }, true);
  }

  error(message: string, duration = 4200): void {
    this.show({ type: 'error', message, duration }, false);
  }

  info(message: string, duration = 2600): void {
    this.show({ type: 'info', message, duration }, true);
  }

  warning(message: string, duration = 3200): void {
    this.show({ type: 'warning', message, duration }, true);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }

  private show(toast: Omit<Toast, 'id' | 'exiting'>, requiresAuth: boolean): void {
    if (requiresAuth && !this.authService.authState().isAuthenticated) {
      return;
    }
    const id = this.nextId++;
    this.toastsSignal.update((list) => [...list, { ...toast, id, exiting: false }]);
    setTimeout(() => this.beginExit(id), toast.duration);
  }

  private beginExit(id: number): void {
    this.toastsSignal.update((list) =>
      list.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => this.dismiss(id), 320);
  }
}