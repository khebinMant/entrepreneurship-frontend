import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-host" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast toast--{{ toast.type }}"
          [class.toast--exiting]="toast.exiting"
          role="status"
        >
          <span class="toast__dot"></span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar notificación">
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: var(--spacing-lg);
      right: var(--spacing-lg);
      z-index: 9999;
      pointer-events: none;
    }

    .toast-host {
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: var(--spacing-sm);
      max-width: 360px;
      width: 100%;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      max-width: 100%;
      padding: 10px 12px;
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--color-surface) 88%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--color-border);
      box-shadow: 0 10px 34px -14px color-mix(in srgb, var(--color-text-primary) 35%, transparent);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      animation: toastIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .toast--exiting {
      animation: toastOut 0.3s ease forwards;
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes toastOut {
      to { opacity: 0; transform: translateY(8px) scale(0.96); }
    }

    .toast__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .toast--success { .toast__dot { background: var(--color-success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 15%, transparent); } }
    .toast--error { .toast__dot { background: var(--color-error); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-error) 15%, transparent); } }
    .toast--info { .toast__dot { background: var(--color-info); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-info) 15%, transparent); } }
    .toast--warning { .toast__dot { background: var(--color-warning); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-warning) 15%, transparent); } }

    .toast__message {
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast__close {
      width: 22px;
      height: 22px;
      border: none;
      background: none;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
    }

    .toast:hover .toast__close {
      opacity: 1;
    }

    .toast__close:hover {
      background: var(--color-surface-alt);
      color: var(--color-text-primary);
    }

    @media (max-width: 640px) {
      :host {
        bottom: var(--spacing-sm);
        right: var(--spacing-sm);
        left: var(--spacing-sm);
      }
      .toast-host { max-width: none; }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}