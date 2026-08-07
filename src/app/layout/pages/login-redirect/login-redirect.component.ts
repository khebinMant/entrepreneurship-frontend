import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';
import { AuthService } from '../../../authentication/services/auth.service';
import { UserService } from '../../../user/services/user.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-login-redirect',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-side">
          <div class="auth-form-inner">
            <div class="auth-form-header">
              <div class="auth-logo">
                <i class="pi pi-briefcase"></i>
              </div>
              <h1 class="auth-form-title">{{ title }}</h1>
              <p class="auth-form-subtitle">{{ subtitle }}</p>
            </div>

            <ng-container *ngIf="!isRegister(); else registerForm">
              <form class="auth-form" (ngSubmit)="onLogin()">
                <div class="auth-field">
                  <label class="auth-label" for="username">Usuario o correo</label>
                  <input
                    id="username"
                    class="auth-input"
                    type="text"
                    [(ngModel)]="username"
                    name="username"
                    placeholder="tu@correo.com"
                    required
                    autocomplete="username"
                  />
                </div>

                <div class="auth-field">
                  <label class="auth-label" for="password">Contraseña</label>
                  <div class="auth-password">
                    <input
                      id="password"
                      class="auth-input"
                      [type]="showPassword ? 'text' : 'password'"
                      [(ngModel)]="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      autocomplete="current-password"
                    />
                    <button type="button" class="auth-password-toggle" (click)="showPassword = !showPassword" tabindex="-1">
                      <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="auth-forgot">
                  <a routerLink="/forgot-password" class="auth-forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                <div class="auth-error" *ngIf="errorMessage()">
                  <i class="pi pi-exclamation-circle"></i>
                  {{ errorMessage() }}
                </div>

                <button
                  class="auth-btn auth-btn--primary"
                  type="submit"
                  [disabled]="loading()"
                >
                  {{ loading() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
              </form>

              <p class="auth-footer">
                ¿No tienes cuenta?
                <a routerLink="/register" class="auth-link">Crear cuenta</a>
              </p>
            </ng-container>

            <ng-template #registerForm>
              <form class="auth-form" (ngSubmit)="onRegister()">
                <div class="auth-field">
                  <label class="auth-label" for="firstName">Nombres</label>
                  <input
                    id="firstName"
                    class="auth-input"
                    type="text"
                    [(ngModel)]="firstName"
                    name="firstName"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div class="auth-field">
                  <label class="auth-label" for="lastName">Apellidos</label>
                  <input
                    id="lastName"
                    class="auth-input"
                    type="text"
                    [(ngModel)]="lastName"
                    name="lastName"
                    placeholder="Tus apellidos"
                    required
                  />
                </div>

                <div class="auth-field">
                  <label class="auth-label" for="regEmail">Correo electrónico</label>
                  <input
                    id="regEmail"
                    class="auth-input"
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    placeholder="tu@correo.com"
                    required
                  />
                </div>

                <div class="auth-field">
                  <label class="auth-label" for="regUsername">Usuario</label>
                  <input
                    id="regUsername"
                    class="auth-input"
                    type="text"
                    [(ngModel)]="username"
                    name="regUsername"
                    placeholder="Nombre de usuario"
                    required
                  />
                </div>

                <div class="auth-field">
                  <label class="auth-label" for="regPassword">Contraseña</label>
                  <div class="auth-password">
                    <input
                      id="regPassword"
                      class="auth-input"
                      [type]="showPassword ? 'text' : 'password'"
                      [(ngModel)]="password"
                      name="regPassword"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" class="auth-password-toggle" (click)="showPassword = !showPassword" tabindex="-1">
                      <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="auth-error" *ngIf="errorMessage()">
                  <i class="pi pi-exclamation-circle"></i>
                  {{ errorMessage() }}
                </div>

                <button
                  class="auth-btn auth-btn--primary"
                  type="submit"
                  [disabled]="loading()"
                >
                  {{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>
              </form>

              <p class="auth-footer">
                ¿Ya tienes cuenta?
                <a routerLink="/login" class="auth-link">Iniciar sesión</a>
              </p>
            </ng-template>
          </div>
        </div>

        <div class="auth-visual-side">
          <div class="auth-visual-grid"></div>
          <div class="auth-visual-glow"></div>
          <div class="auth-visual-art" aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="62" r="20" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" />
              <circle cx="44" cy="144" r="15" stroke="rgba(255,255,255,0.65)" stroke-width="2.5" />
              <circle cx="156" cy="144" r="15" stroke="rgba(255,255,255,0.65)" stroke-width="2.5" />
              <path d="M100 82 C 90 106 62 122 52 136" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" />
              <path d="M100 82 C 110 106 138 122 148 136" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" />
              <path d="M100 82 C 100 112 100 126 100 146" stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-dasharray="5 6" />
              <circle cx="100" cy="62" r="5" fill="rgba(255,255,255,0.95)" />
              <circle cx="44" cy="144" r="3.5" fill="rgba(255,255,255,0.7)" />
              <circle cx="156" cy="144" r="3.5" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <div class="auth-visual-caption">
            <span class="auth-visual-brand">Emprendia</span>
            <p>Conecta, crece y haz realidad tu emprendimiento</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }
    .auth-container {
      display: flex;
      width: 100%;
      max-width: 920px;
      min-height: 500px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--color-border);
      box-shadow: 0 16px 48px rgba(0,0,0,0.08);
    }
    .auth-form-side {
      flex: 1;
      padding: var(--spacing-xxl);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface);
    }
    .auth-form-inner {
      width: 100%;
      max-width: 360px;
    }
    .auth-form-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .auth-logo {
      width: 56px;
      height: 56px;
      margin: 0 auto var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-primary-light);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      color: var(--color-primary);
      i { font-size: 24px; }
    }
    .auth-form-title {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }
    .auth-form-subtitle {
      color: var(--color-text-secondary);
      margin: var(--spacing-xs) 0 0;
      font-size: var(--font-size-sm);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    .auth-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    .auth-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .auth-input {
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
    .auth-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    .auth-input::placeholder {
      color: var(--color-text-muted);
    }
    .auth-password {
      position: relative;
    }
    .auth-password .auth-input {
      padding-right: 40px;
    }
    .auth-password-toggle {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
    }
    .auth-password-toggle:hover {
      color: var(--color-text-primary);
    }
    .auth-forgot {
      text-align: right;
      margin-top: -8px;
    }
    .auth-forgot-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      font-weight: 500;
      text-decoration: none;
    }
    .auth-forgot-link:hover {
      text-decoration: underline;
    }
    .auth-error {
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
    .auth-footer {
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--spacing-lg) 0 0;
    }
    .auth-link {
      color: var(--color-primary);
      font-weight: 600;
    }
    .auth-link:hover {
      text-decoration: underline;
    }

    .auth-visual-side {
      flex: 0 0 380px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(150deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
    }
    .auth-visual-grid {
      position: absolute;
      inset: 0;
      z-index: 1;
      background-image:
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 78%);
      -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 78%);
    }
    .auth-visual-glow {
      position: absolute;
      width: 240px;
      height: 240px;
      top: -60px;
      right: -60px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      filter: blur(60px);
      z-index: 1;
    }
    .auth-visual-art {
      position: relative;
      z-index: 2;
      width: 150px;
      height: 150px;
      margin-bottom: var(--spacing-xl);
      svg {
        width: 100%;
        height: 100%;
      }
    }
    .auth-visual-caption {
      position: relative;
      z-index: 2;
      text-align: center;
      color: #fff;
      padding: 0 var(--spacing-xl);
    }
    .auth-visual-brand {
      display: block;
      font-size: var(--font-size-xxl);
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #fff;
      margin-bottom: var(--spacing-xs);
    }
    .auth-visual-caption p {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: rgba(255,255,255,0.85);
    }

    @media (max-width: 768px) {
      .auth-visual-side {
        display: none;
      }
      .auth-form-side {
        padding: var(--spacing-lg);
      }
    }
  `],
})
export class LoginRedirectComponent {
  private readonly router = inject(Router);
  private readonly directAuth = inject(DirectAuthService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly isRegister = computed(() => this.router.url.includes('/register'));

  username = '';
  password = '';
  firstName = '';
  lastName = '';
  email = '';
  loading = signal(false);
  errorMessage = signal('');
  showPassword = false;

  get title(): string {
    return this.isRegister() ? 'Crear Cuenta' : 'Iniciar Sesión';
  }

  get subtitle(): string {
    return this.isRegister() ? 'Regístrate en Emprendia' : 'Accede a tu cuenta de Emprendia';
  }

  async onLogin(): Promise<void> {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.directAuth.login(this.username, this.password);
    } catch (err: any) {
      if (err.status === 400 || err.status === 401) {
        this.errorMessage.set('Usuario o contraseña incorrectos');
        this.toastService.error('Usuario o contraseña incorrectos.');
      } else if (err.error?.error_description) {
        this.errorMessage.set(err.error.error_description);
        this.toastService.error(err.error.error_description);
      } else {
        this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
        this.toastService.error('Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister(): Promise<void> {
    if (!this.firstName || !this.lastName || !this.email || !this.username || !this.password) {
      this.errorMessage.set('Todos los campos son obligatorios');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      await lastValueFrom(this.userService.register({
        username: this.username,
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        profilePictureUrl: null,
      }));
      this.router.navigate(['/login']);
      this.toastService.success('Cuenta creada correctamente. Inicia sesión.');
    } catch (err: any) {
      if (err.status === 409) {
        this.errorMessage.set('El usuario o correo ya está registrado');
        this.toastService.error('El usuario o correo ya está registrado.');
      } else if (err.error?.message) {
        this.errorMessage.set(err.error.message);
        this.toastService.error(err.error.message);
      } else {
        this.errorMessage.set('Error al crear la cuenta. Intenta nuevamente.');
        this.toastService.error('Error al crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
