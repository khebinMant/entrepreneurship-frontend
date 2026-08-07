import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-portal-view',
  standalone: true,
  template: `
    <section class="portal-view">
      <header class="portal-view__bar">
        <div class="portal-view__identity">
          <i class="pi pi-globe"></i>
          <span class="portal-view__name">{{ title }}</span>
        </div>
        @if (domain) {
          <div class="portal-view__url" title="{{ domain }}">
            <i class="pi pi-lock"></i>
            <span>{{ domain }}</span>
          </div>
        }
        <div class="portal-view__bar-actions">
          <span class="portal-view__live"><span class="portal-view__live-dot"></span> En vivo</span>
          <button class="portal-view__expand" type="button" (click)="expanded.set(true)" title="Ver el portal a pantalla completa">
            <i class="pi pi-window-maximize"></i>
          </button>
        </div>
      </header>
      <div class="portal-view__stage">
        <div class="portal-view__browser-pill">
          <i class="pi pi-globe"></i> Portal web de {{ title }} · emprendia.duckdns.org
        </div>
        <iframe class="portal-view__frame" [srcdoc]="document" [title]="title" loading="lazy"></iframe>
      </div>
    </section>

    @if (expanded()) {
      <div class="portal-maximize">
        <div class="portal-maximize__topbar">
          <div class="portal-maximize__brand">
            <span class="portal-maximize__logo">E</span>
            <span class="portal-maximize__title-hint">Estás viendo <strong>{{ title }}</strong> a través de Emprendia</span>
          </div>
          <div class="portal-maximize__actions">
            <span class="portal-maximize__live"><span class="portal-maximize__live-dot"></span> En vivo</span>
            <button class="portal-maximize__close" type="button" (click)="expanded.set(false)" aria-label="Cerrar vista completa">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <iframe class="portal-maximize__frame" [srcdoc]="document" [title]="title" loading="lazy"></iframe>
      </div>
    }
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .portal-view {
      width: 100%;
      background: var(--color-surface);
      border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
      border-radius: 24px;
      box-shadow: 0 12px 40px -18px color-mix(in srgb, var(--color-text-primary) 30%, transparent);
      overflow: hidden;
    }
    .portal-view__bar {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)),
        var(--color-surface));
      border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
      flex-wrap: wrap;
    }
    .portal-view__identity {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      > i { font-size: 16px; color: var(--color-primary); flex-shrink: 0; }
    }
    .portal-view__name {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .portal-view__url {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 40%;
      padding: 4px 12px;
      border-radius: 999px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      > i { font-size: 11px; flex-shrink: 0; }
      span { overflow: hidden; text-overflow: ellipsis; }
    }
    .portal-view__bar-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .portal-view__live,
    .portal-maximize__live {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-success);
      padding: 5px 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--color-success) 12%, transparent);
      white-space: nowrap;
    }
    .portal-view__live-dot,
    .portal-maximize__live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--color-success);
      animation: portal-pulse 1.6s ease-in-out infinite;
    }
    @keyframes portal-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .portal-view__expand {
      width: 34px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 13px;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-primary); border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border)); }
    }
    .portal-view__stage {
      padding: var(--spacing-lg);
      background: var(--color-surface-alt);
    }
    .portal-view__browser-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
      i { font-size: 12px; }
    }
    .portal-view__frame {
      display: block;
      width: 100%;
      min-height: 460px;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 4px 20px -8px color-mix(in srgb, var(--color-text-primary) 25%, transparent);
    }

    /* ===== Maximize overlay (estilo YouTube) ===== */
    .portal-maximize {
      position: fixed;
      inset: 0;
      z-index: 9000;
      background: var(--color-bg);
      display: flex;
      flex-direction: column;
    }
    .portal-maximize__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      flex-wrap: wrap;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .portal-maximize__brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      min-width: 0;
    }
    .portal-maximize__logo {
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      flex-shrink: 0;
    }
    .portal-maximize__title-hint {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      strong { color: var(--color-text-primary); }
    }
    .portal-maximize__actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .portal-maximize__close {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 15px;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-error); border-color: color-mix(in srgb, var(--color-error) 45%, var(--color-border)); }
    }
    .portal-maximize__frame {
      flex: 1;
      width: 100%;
      border: none;
      background: #fff;
    }

    @media (max-width: 768px) {
      .portal-view { border-radius: 18px; }
      .portal-view__bar { padding: var(--spacing-md); }
      .portal-view__url { max-width: 100%; order: 3; }
      .portal-view__stage { padding: var(--spacing-md); }
      .portal-view__frame { min-height: 420px; }
      .portal-maximize__topbar { padding: var(--spacing-sm) var(--spacing-md); }
    }
  `],
})
export class PortalViewComponent implements OnInit {
  @Input() html = '';
  @Input() title = 'Portal';
  @Input() domain = '';
  @Input() autoExpand = false;

  readonly expanded = signal(false);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    if (this.autoExpand) {
      this.expanded.set(true);
    }
  }

  get document(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.buildDocument());
  }

  private buildDocument(): string {
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement?.dataset?.['theme'] === 'dark';
    const bg = isDark ? '#0c0c0f' : '#ffffff';
    const fg = isDark ? '#fafafa' : '#0f172a';
    const muted = isDark ? '#a1a1aa' : '#64748b';
    const primary = isDark ? '#60a5fa' : '#2563eb';
    const accent = '#f59e0b';

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root {
    --bg: ${bg};
    --fg: ${fg};
    --muted: ${muted};
    --primary: ${primary};
    --accent: ${accent};
  }
  * { box-sizing: border-box; }
  html, body { min-height: 100%; }
  body {
    margin: 0;
    padding: 32px;
    background: var(--bg);
    color: var(--fg);
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }
  h1, h2, h3, h4 { line-height: 1.2; letter-spacing: -0.02em; margin: 0 0 12px; }
  h1 { font-size: 2rem; }
  p { margin: 0 0 16px; }
  a { color: var(--primary); }
  img { max-width: 100%; height: auto; border-radius: 12px; }
  button { font: inherit; }
  ::selection { background: color-mix(in srgb, var(--primary) 30%, transparent); }
</style>
</head>
<body>
${this.html}
</body>
</html>`;
  }
}