import { Component, signal, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [DatePipe, NgClass],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast toast--{{ toast.type }}"
          [class.toast--exiting]="toast.exiting"
          role="status"
        >
          <span class="toast__led" [ngClass]="'toast__led--' + toast.type"></span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar notificación">
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
    </div>

    <div class="toast-log" [class.toast-log--open]="logOpen()">
      <button class="toast-log__toggle" (click)="logOpen.update((v) => !v)" aria-label="Actividad del sistema">
        <i class="pi pi-history"></i>
        @if (logService().length) {
          <span class="toast-log__led-count">{{ logService().length }}</span>
        }
      </button>
      @if (logOpen()) {
        <div class="toast-log__panel">
          <div class="toast-log__head">
            <span><i class="pi pi-bolt"></i> Actividad</span>
            <button class="toast-log__clear" (click)="toastService.clearLog()" title="Limpiar">Limpiar</button>
          </div>
          <div class="toast-log__list">
            @if (logService().length === 0) {
              <div class="toast-log__empty">Aún no hay actividad registrada.</div>
            } @else {
              @for (entry of logService(); track entry.id) {
                <div class="toast-log__entry">
                  <span class="toast-log__led" [class]="'toast-log__led--' + entry.type"></span>
                  <span class="toast-log__text">{{ entry.message }}</span>
                  <span class="toast-log__time">{{ entry.at | date: 'HH:mm' }}</span>
                </div>
              }
            }
          </div>
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

    .toast-stack {
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
      padding: 9px 12px;
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--color-surface) 88%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--color-border);
      box-shadow: 0 10px 34px -14px color-mix(in srgb, var(--color-text-primary) 35%, transparent);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      animation: toastIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      transition: background var(--transition-fast);
      &:hover { background: color-mix(in srgb, var(--color-surface) 96%, transparent); }
    }

    .toast--exiting { animation: toastOut 0.3s ease forwards; }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toastOut {
      to { opacity: 0; transform: translateY(8px) scale(0.96); }
    }

    /* LED indicador */
    .toast__led,
    .toast-log__led {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .toast__led--success, .toast-log__led--success { background: var(--color-success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 16%, transparent); }
    .toast__led--error, .toast-log__led--error { background: var(--color-error); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-error) 16%, transparent); }
    .toast__led--info, .toast-log__led--info { background: var(--color-info); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-info) 16%, transparent); }
    .toast__led--warning, .toast-log__led--warning { background: var(--color-warning); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-warning) 16%, transparent); }

    .toast__message {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 1.4em;
      line-height: 1.4;
      transition: max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast:hover .toast__message {
      max-height: 8em;
      white-space: normal;
    }

    .toast__close {
      width: 22px; height: 22px;
      border: none;
      background: none;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
    }
    .toast:hover .toast__close { opacity: 1; }
    .toast__close:hover { background: var(--color-surface-alt); color: var(--color-text-primary); }

    /* ===== Log de actividad ===== */
    .toast-log {
      position: fixed;
      bottom: var(--spacing-lg);
      left: var(--spacing-lg);
      pointer-events: none;
      z-index: 9999;
    }
    .toast-log:hover { pointer-events: auto; }
    .toast-log__toggle {
      pointer-events: auto;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 16px;
      box-shadow: 0 8px 24px -10px color-mix(in srgb, var(--color-text-primary) 35%, transparent);
      transition: all var(--transition-fast);
      position: relative;
      &:hover { color: var(--color-primary); transform: translateY(-2px); }
    }
    .toast-log__led-count {
      position: absolute;
      top: -4px; right: -4px;
      min-width: 18px; height: 18px;
      padding: 0 4px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 999px;
      background: var(--color-primary);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
    }
    .toast-log__panel {
      pointer-events: auto;
      position: absolute;
      bottom: 56px;
      left: 0;
      width: min(320px, calc(100vw - var(--spacing-lg) * 2));
      max-height: 60vh;
      display: flex;
      flex-direction: column;
      background: color-mix(in srgb, var(--color-surface) 94%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--color-border);
      border-radius: 18px;
      box-shadow: 0 18px 50px -18px color-mix(in srgb, var(--color-text-primary) 40%, transparent);
      overflow: hidden;
      animation: logIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom left;
    }
    @keyframes logIn {
      from { opacity: 0; transform: translateY(8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .toast-log__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .toast-log__clear {
      border: none; background: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: var(--font-size-xs);
      font-weight: 600;
      &:hover { color: var(--color-text-primary); }
    }
    .toast-log__list {
      overflow-y: auto;
      padding: var(--spacing-xs);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .toast-log__empty {
      padding: var(--spacing-lg);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
    .toast-log__entry {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 12px;
      transition: background var(--transition-fast);
      &:hover { background: var(--color-surface-alt); }
    }
    .toast-log__led { margin-top: 4px; }
    .toast-log__text {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      line-height: 1.35;
      word-break: break-word;
    }
    .toast-log__time {
      font-size: 10px;
      color: var(--color-text-muted);
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      :host {
        bottom: var(--spacing-sm);
        right: var(--spacing-sm);
        left: var(--spacing-sm);
      }
      .toast-stack { max-width: none; }
      .toast-log { bottom: var(--spacing-sm); left: var(--spacing-sm); }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly logOpen = signal(false);

  logService(): import('./toast.service').LoggedToast[] {
    return this.toastService.log();
  }
}