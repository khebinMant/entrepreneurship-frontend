import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { SessionTimeoutService } from '../services/session-timeout.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="session-overlay" *ngIf="timeoutService.sessionExpired()">
      <div class="session-modal">
        <div class="session-modal__icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h2 class="session-modal__title">Sesión Expirada</h2>
        <p class="session-modal__message">
          Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente para continuar.
        </p>
        <button class="session-modal__btn" (click)="timeoutService.dismissModal()">
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  `,
  styles: [`
    .session-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    .session-modal {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xxl);
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.3s ease;
    }
    .session-modal__icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #fef2f2;
      color: var(--color-error);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto var(--spacing-md);
    }
    .session-modal__title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-sm);
    }
    .session-modal__message {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-lg);
      line-height: 1.5;
    }
    .session-modal__btn {
      padding: 12px 32px;
      background: var(--color-primary);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .session-modal__btn:hover {
      background: var(--color-primary-dark);
    }
  `],
})
export class SessionExpiredModalComponent {
  readonly timeoutService = inject(SessionTimeoutService);
}
