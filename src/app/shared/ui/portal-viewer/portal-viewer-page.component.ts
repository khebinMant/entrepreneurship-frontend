import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../../event/services/event.service';
import { EntrepreneurshipService } from '../../../entrepreneurship/services/entrepreneurship.service';
import type { EntityPortal } from '../../../entrepreneurship/models/entrepreneurship-portal';
import { PortalViewComponent } from '../portal-view/portal-view.component';

@Component({
  selector: 'app-portal-viewer-page',
  standalone: true,
  imports: [RouterLink, PortalViewComponent],
  template: `
    <div class="viewer-page">
      <header class="viewer-page__bar">
        <a class="viewer-page__brand" routerLink="/">
          <span class="viewer-page__logo">E</span>
          <span class="viewer-page__brand-text">mprendia</span>
          <span class="viewer-page__tagline">Portal de <strong>{{ entityLabel() }}</strong> visto a través de Emprendia</span>
        </a>
        <a class="viewer-page__home" routerLink="/"><i class="pi pi-arrow-left"></i> Volver a Emprendia</a>
      </header>

      <main class="viewer-page__content">
        @switch (status()) {
          @case ('loading') {
            <div class="viewer-page__state">
              <div class="skeleton skeleton--card" style="height: 100%;"></div>
            </div>
          }
          @case ('error') {
            <div class="viewer-page__error">
              <i class="pi pi-wifi portal-svg"></i>
              <h1>No encontramos ese portal</h1>
              <p>La dirección que buscas no está publicada. Vuelve a Emprendia para descubrir eventos y emprendimientos.</p>
              <a class="btn btn--primary" routerLink="/">Ir al inicio</a>
            </div>
          }
          @case ('ready') {
            @if (portal(); as p) {
              <app-portal-view
                [html]="p.htmlContent || ''"
                [title]="entityLabel()"
                [domain]="domain()"
                [autoExpand]="true"
              />
            }
          }
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--color-bg); }
    .viewer-page__bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      flex-wrap: wrap;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .viewer-page__brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      text-decoration: none;
      color: var(--color-text-primary);
      min-width: 0;
    }
    .viewer-page__logo {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: #fff;
      font-weight: 800;
      font-size: 17px;
      flex-shrink: 0;
    }
    .viewer-page__brand-text {
      font-weight: 800;
      font-size: var(--font-size-lg);
    }
    .viewer-page__tagline {
      display: none;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      strong { color: var(--color-primary); }
    }
    .viewer-page__home {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: 600;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-primary); border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border)); }
    }
    .viewer-page__content {
      padding: var(--spacing-lg);
      min-height: calc(100vh - 65px);
    }
    .viewer-page__error {
      max-width: 460px;
      margin: 12vh auto 0;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      i {
        font-size: 40px;
        color: var(--color-text-muted);
      }
      p { color: var(--color-text-muted); }
    }
    @media (min-width: 768px) {
      .viewer-page__tagline { display: block; }
    }
  `],
})
export class PortalViewerPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);

  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly portal = signal<EntityPortal | null>(null);
  readonly domain = signal('');
  readonly entityLabel = signal('');

  constructor() {
    const sub = this.route.snapshot.paramMap.get('subdomain') || '';
    if (!sub) {
      this.status.set('error');
      return;
    }
    this.domain.set(`${sub}.emprendia.com`);
    void this.resolve(sub);
  }

  private async resolve(sub: string): Promise<void> {
    try {
      const ev = await lastValueFrom(this.eventService.getPortalBySubdomain(sub));
      this.portal.set(ev);
      this.entityLabel.set('Evento');
      this.status.set('ready');
      return;
    } catch {
      /* probar emprendimiento */
    }
    try {
      const entrep = await lastValueFrom(this.entrepreneurshipService.getPortalBySubdomain(sub));
      this.portal.set(entrep);
      this.entityLabel.set('Emprendimiento');
      this.status.set('ready');
      return;
    } catch {
      this.status.set('error');
    }
  }
}