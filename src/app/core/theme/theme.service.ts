import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.getInitialTheme());
  readonly currentTheme = signal<Theme>(this.getInitialTheme() ? 'dark' : 'light');

  constructor() {
    effect(() => {
      const dark = this.isDark();
      const theme = dark ? 'dark' : 'light';
      localStorage.setItem('emprendia_theme', theme);
      document.documentElement.dataset['theme'] = theme;
      this.currentTheme.set(theme);
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('emprendia_theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
