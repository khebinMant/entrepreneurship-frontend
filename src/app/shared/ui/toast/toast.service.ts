import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, title = '¡Listo!', duration = 3500): void {
    this.show({ type: 'success', message, title, duration });
  }

  error(message: string, title = 'Ocurrió un error', duration = 5000): void {
    this.show({ type: 'error', message, title, duration });
  }

  info(message: string, title = 'Información', duration = 3500): void {
    this.show({ type: 'info', message, title, duration });
  }

  warning(message: string, title = 'Atención', duration = 4000): void {
    this.show({ type: 'warning', message, title, duration });
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.nextId++;
    this.toastsSignal.update((list) => [...list, { ...toast, id }]);
    setTimeout(() => this.dismiss(id), toast.duration);
  }
}
