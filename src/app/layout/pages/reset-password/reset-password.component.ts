import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="reset-page">
      <div class="reset-card">
        <div class="reset-header">
          <h1 class="reset-title">Restablecer contraseña</h1>
          <p class="reset-subtitle">Ingresa tu nueva contraseña</p>
        </div>

        <div *ngIf="success()" class="reset-success">
          <i class="pi pi-check-circle"></i>
          <h3>Contraseña actualizada</h3>
          <p>Tu contraseña se ha restablecido correctamente.</p>
          <a routerLink="/login" class="auth-btn auth-btn--primary" style="display:inline-flex;margin-top:var(--spacing-md)">Iniciar sesión</a>
        </div>

        <form class="reset-form" (ngSubmit)="onSubmit()" *ngIf="!success()">
          <div class="reset-field">
            <label class="reset-label" for="newPassword">Nueva contraseña</label>
            <input
              id="newPassword"
              class="reset-input"
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>

          <div class="reset-field">
            <label class="reset-label" for="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              class="reset-input"
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Repite la contraseña"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>

          <div class="reset-error" *ngIf="errorMessage()">
            <i class="pi pi-exclamation-circle"></i>
            {{ errorMessage() }}
          </div>

          <button
            class="auth-btn auth-btn--primary"
            type="submit"
            [disabled]="loading()"
            style="width:100%"
          >
            {{ loading() ? 'Restableciendo...' : 'Restablecer contraseña' }}
          </button>
        </form>

        <p class="reset-footer">
          <a routerLink="/login" class="auth-link">Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .reset-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }
    .reset-card {
      width: 100%;
      max-width: 420px;
      padding: var(--spacing-xl);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .reset-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .reset-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }
    .reset-subtitle {
      color: var(--color-text-secondary);
      margin: var(--spacing-xs) 0 0;
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }
    .reset-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    .reset-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    .reset-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .reset-input {
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      background: var(--color-surface);
      transition: border-color var(--transition-fast);
      width: 100%;
      box-sizing: border-box;
    }
    .reset-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    .reset-input::placeholder {
      color: var(--color-text-muted);
    }
    .reset-error {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 10px 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      color: #b91c1c;
      font-size: var(--font-size-sm);
    }
    .reset-success {
      text-align: center;
      padding: var(--spacing-lg) 0;
    }
    .reset-success i {
      font-size: 48px;
      color: #16a34a;
      margin-bottom: var(--spacing-md);
    }
    .reset-success h3 {
      font-size: var(--font-size-lg);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-sm);
    }
    .reset-success p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.5;
    }
    .auth-btn {
      padding: 12px 20px;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }
    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .auth-btn--primary {
      background: var(--color-primary);
      color: #fff;
    }
    .auth-btn--primary:hover:not(:disabled) {
      background: var(--color-primary-dark);
    }
    .auth-link {
      color: var(--color-primary);
      font-weight: 600;
      text-decoration: none;
    }
    .auth-link:hover {
      text-decoration: underline;
    }
    .reset-footer {
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--spacing-lg) 0 0;
    }
  `],
})
export class ResetPasswordComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  errorMessage = signal('');
  success = signal(false);

  private get token(): string | null {
    return this.route.snapshot.queryParamMap.get('token');
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');

    if (!this.token) {
      this.errorMessage.set('Token inválido o expirado.');
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);

    try {
      await lastValueFrom(
        this.http.post(
          `${environment.services.user}/api/v1/auth/reset-password`,
          { token: this.token, newPassword: this.newPassword },
        ),
      );
      this.success.set(true);
    } catch (err: any) {
      if (err.status === 400) {
        this.errorMessage.set('El token es inválido o ha expirado.');
      } else {
        this.errorMessage.set('Ocurrió un error. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
