import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="forgot-page">
      <div class="forgot-container">
        <div class="forgot-image-side">
          <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80" alt="" />
          <div class="forgot-image-overlay">
            <h2>Emprendia</h2>
            <p>Recupera el acceso a tu cuenta</p>
          </div>
        </div>

        <div class="forgot-form-side">
          <div class="forgot-form-inner">
            <div class="forgot-form-header">
              <h1 class="forgot-form-title">¿Olvidaste tu contraseña?</h1>
              <p class="forgot-form-subtitle">Ingresa tu correo y te enviaremos un enlace para restablecerla</p>
            </div>

            <div *ngIf="sent()" class="forgot-success">
              <i class="pi pi-check-circle"></i>
              <h3>Correo enviado</h3>
              <p>Revisa tu bandeja de entrada. Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</p>
              <a routerLink="/login" class="auth-btn auth-btn--primary" style="display:inline-flex;margin-top:var(--spacing-md)">Volver al inicio de sesión</a>
            </div>

            <form class="forgot-form" (ngSubmit)="onSubmit()" *ngIf="!sent()">
              <div class="forgot-field">
                <label class="forgot-label" for="email">Correo electrónico</label>
                <input
                  id="email"
                  class="forgot-input"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="tu@correo.com"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="forgot-error" *ngIf="errorMessage()">
                <i class="pi pi-exclamation-circle"></i>
                {{ errorMessage() }}
              </div>

              <button
                class="auth-btn auth-btn--primary"
                type="submit"
                [disabled]="loading()"
                style="width:100%"
              >
                {{ loading() ? 'Enviando...' : 'Enviar enlace de recuperación' }}
              </button>
            </form>

            <p class="forgot-footer" *ngIf="!sent()">
              <a routerLink="/login" class="auth-link">Volver al inicio de sesión</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }
    .forgot-container {
      display: flex;
      width: 100%;
      max-width: 900px;
      min-height: 500px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .forgot-image-side {
      flex: 0 0 380px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .forgot-image-side img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .forgot-image-overlay {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: var(--spacing-xl);
      color: #fff;
    }
    .forgot-image-overlay h2 {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      margin: 0 0 var(--spacing-sm);
    }
    .forgot-image-overlay p {
      font-size: var(--font-size-md);
      opacity: 0.9;
      margin: 0;
    }
    .forgot-form-side {
      flex: 1;
      padding: var(--spacing-xxl);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface);
    }
    .forgot-form-inner {
      width: 100%;
      max-width: 360px;
    }
    .forgot-form-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .forgot-form-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }
    .forgot-form-subtitle {
      color: var(--color-text-secondary);
      margin: var(--spacing-xs) 0 0;
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }
    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    .forgot-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    .forgot-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .forgot-input {
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
    .forgot-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    .forgot-input::placeholder {
      color: var(--color-text-muted);
    }
    .forgot-error {
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
    .forgot-success {
      text-align: center;
      padding: var(--spacing-lg) 0;
    }
    .forgot-success i {
      font-size: 48px;
      color: #16a34a;
      margin-bottom: var(--spacing-md);
    }
    .forgot-success h3 {
      font-size: var(--font-size-lg);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-sm);
    }
    .forgot-success p {
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
    .forgot-footer {
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--spacing-lg) 0 0;
    }
    @media (max-width: 768px) {
      .forgot-image-side { display: none; }
      .forgot-form-side { padding: var(--spacing-lg); }
    }
  `],
})
export class ForgotPasswordComponent {
  private readonly http = inject(HttpClient);

  email = '';
  loading = signal(false);
  errorMessage = signal('');
  sent = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email) return;
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await lastValueFrom(
        this.http.post(
          `${environment.keycloak.url}/realms/${environment.keycloak.realm}/login-actions/reset-credentials`,
          { email: this.email, client_id: environment.keycloak.clientId },
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) },
        ),
      );
      this.sent.set(true);
    } catch {
      this.sent.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
