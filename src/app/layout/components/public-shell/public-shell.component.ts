import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavComponent } from '../public-nav/public-nav.component';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterOutlet, PublicNavComponent],
  template: `
    <app-public-nav />
    <main class="public-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .public-content {
      padding-top: var(--header-height);
      min-height: 100vh;
    }
  `],
})
export class PublicShellComponent {}
