import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="theme-toggle"
      (click)="themeService.toggle()"
      [attr.aria-label]="themeService.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
    >
      <i [class]="themeService.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
      background: var(--color-surface);
      transition: all var(--transition-fast);
    }
    .theme-toggle:hover {
      background: var(--color-surface-alt);
      color: var(--color-primary);
    }
  `],
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
