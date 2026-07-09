import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DirectAuthService } from '../../../authentication/services/direct-auth.service';
import { AuthService } from '../../../authentication/services/auth.service';
import { UserService } from '../../../user/services/user.service';
import { environment } from '../../../../environments/environment';

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

              <div class="auth-divider">
                <span>O continúa con</span>
              </div>

              <div class="auth-social">
                <button class="auth-btn auth-btn--outline" (click)="loginGoogle()">
                  <i class="pi pi-google"></i> Google
                </button>
                <button class="auth-btn auth-btn--outline" (click)="loginFacebook()">
                  <i class="pi pi-facebook"></i> Facebook
                </button>
              </div>

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

              <div class="auth-divider">
                <span>O regístrate con</span>
              </div>

              <div class="auth-social">
                <button class="auth-btn auth-btn--outline" (click)="loginGoogle()">
                  <i class="pi pi-google"></i> Google
                </button>
                <button class="auth-btn auth-btn--outline" (click)="loginFacebook()">
                  <i class="pi pi-facebook"></i> Facebook
                </button>
              </div>

              <p class="auth-footer">
                ¿Ya tienes cuenta?
                <a routerLink="/login" class="auth-link">Iniciar sesión</a>
              </p>
            </ng-template>
          </div>
        </div>

        <div class="auth-image-side">
          <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80" alt="Emprendimiento" />
          <div class="auth-image-overlay">
            <h2>Emprendia</h2>
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
      max-width: 900px;
      min-height: 500px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
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
    .auth-btn--outline {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      flex: 1;
    }
    .auth-btn--outline:hover {
      background: var(--color-surface-alt);
    }
    .auth-divider {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      margin: var(--spacing-lg) 0;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-border);
    }
    .auth-social {
      display: flex;
      gap: var(--spacing-sm);
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

    .auth-image-side {
      flex: 0 0 380px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-image-side img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .auth-image-overlay {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: var(--spacing-xl);
      color: #fff;
    }
    .auth-image-overlay h2 {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      margin: 0 0 var(--spacing-sm);
    }
    .auth-image-overlay p {
      font-size: var(--font-size-md);
      opacity: 0.9;
      margin: 0;
    }

    @media (max-width: 768px) {
      .auth-image-side {
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
      } else if (err.error?.error_description) {
        this.errorMessage.set(err.error.error_description);
      } else {
        this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
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
    } catch (err: any) {
      if (err.status === 409) {
        this.errorMessage.set('El usuario o correo ya está registrado');
      } else if (err.error?.message) {
        this.errorMessage.set(err.error.message);
      } else {
        this.errorMessage.set('Error al crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  loginGoogle(): void {
    window.location.href = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/auth?client_id=${environment.keycloak.clientId}&redirect_uri=${window.location.origin}/&response_type=code&scope=openid&kc_idp_hint=google`;
  }

  loginFacebook(): void {
    window.location.href = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/auth?client_id=${environment.keycloak.clientId}&redirect_uri=${window.location.origin}/&response_type=code&scope=openid&kc_idp_hint=facebook`;
  }
}
