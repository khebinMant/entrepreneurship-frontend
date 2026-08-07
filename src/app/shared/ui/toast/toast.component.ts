import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-host" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" [class.toast--enter]="true" role="status">
          <div class="toast__icon">
            <i class="{{ icon(toast.type) }}"></i>
          </div>
          <div class="toast__content">
            @if (toast.title) {
              <strong class="toast__title">{{ toast.title }}</strong>
            }
            <span class="toast__message">{{ toast.message }}</span>
          </div>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar notificación">
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .toast-host {
      position: fixed;
      top: calc(var(--header-height) + var(--spacing-md));
      right: var(--spacing-lg);
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 380px;
      width: calc(100% - var(--spacing-lg) * 2);
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-left-width: 4px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(24px) scale(0.96); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    .toast--success {
      border-left-color: var(--color-success);
      .toast__icon { background: color-mix(in srgb, var(--color-success) 12%, var(--color-surface)); color: var(--color-success); }
    }
    .toast--error {
      border-left-color: var(--color-error);
      .toast__icon { background: color-mix(in srgb, var(--color-error) 12%, var(--color-surface)); color: var(--color-error); }
    }
    .toast--info {
      border-left-color: var(--color-info);
      .toast__icon { background: color-mix(in srgb, var(--color-info) 12%, var(--color-surface)); color: var(--color-info); }
    }
    .toast--warning {
      border-left-color: var(--color-warning);
      .toast__icon { background: color-mix(in srgb, var(--color-warning) 12%, var(--color-surface)); color: var(--color-warning); }
    }

    .toast__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      font-size: 16px;
      flex-shrink: 0;
    }

    .toast__content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }

    .toast__title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .toast__message {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.45;
    }

    .toast__close {
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-surface-alt);
        color: var(--color-text-primary);
      }
    }

    @media (max-width: 640px) {
      .toast-host {
        right: var(--spacing-sm);
        left: var(--spacing-sm);
        width: auto;
        max-width: none;
        top: calc(var(--header-height) + var(--spacing-sm));
      }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  icon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      info: 'pi pi-info-circle',
      warning: 'pi pi-exclamation-triangle',
    };
    return icons[type];
  }
}
