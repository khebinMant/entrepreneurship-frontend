import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { AppConfigService } from '../../core/config/services/app-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly baseUrl = this.config.userUrl;

  login(username: string, password: string) {
    return this.api.post(this.baseUrl, '/auth/login', { username, password });
  }

  register(data: { username: string; email: string; password: string; firstName: string; lastName: string }) {
    return this.api.post(this.baseUrl, '/auth/register', data);
  }

  logout() {
    return this.api.post(this.baseUrl, '/auth/logout', {});
  }

  refreshToken(refreshToken: string) {
    return this.api.post(this.baseUrl, '/auth/refresh', { refreshToken });
  }
}
