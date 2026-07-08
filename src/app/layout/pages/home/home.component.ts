import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../../event/services/event.service';
import { EntrepreneurshipService } from '../../../entrepreneurship/services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { HeroCarouselComponent } from '../../../shared/ui/hero-carousel/hero-carousel.component';
import type { Event } from '../../../event/models/event';
import type { Entrepreneurship } from '../../../entrepreneurship/models/entrepreneurship';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, HeroCarouselComponent],
  template: `
    <!-- HERO CAROUSEL -->
    <section class="carousel-section">
      <app-hero-carousel [items]="events()" [template]="eventSlide" />

      <ng-template #eventSlide let-event>
        <div class="slide">
          <div class="slide__image">
            <img [src]="imageService.getEntityImageUrl(event, 'EVENT', event.eventId)" alt="{{ event.name }}" loading="lazy" />
          </div>
          <div class="slide__info">
            <span class="slide__badge">{{ event.eventTypeName || 'Evento' }}</span>
            <h2 class="slide__title">{{ event.name }}</h2>
            <div class="slide__meta">
              <span><i class="pi pi-calendar"></i> {{ event.startDatetime | date:'longDate' }}</span>
              <span><i class="pi pi-map-marker"></i> {{ event.addressLine || event.cityName || 'Por definir' }}</span>
            </div>
            <p class="slide__desc">{{ event.description }}</p>
            <a class="slide__btn" [routerLink]="'/events/' + event.eventId">Ver Evento &rarr;</a>
          </div>
        </div>
      </ng-template>

      @if (events().length === 0) {
        <div class="carousel-empty">
          <i class="pi pi-calendar"></i>
          <p>No hay eventos próximos</p>
        </div>
      }
    </section>

    <!-- EMPRENDIMIENTOS -->
    <section class="section" id="emprendimientos">
      <div class="section-header">
        <h2 class="section-title">Emprendimientos Destacados</h2>
        <p class="section-subtitle">Explora los proyectos innovadores de nuestra comunidad</p>
      </div>

      @if (entrepreneurships().length > 0) {
        <div class="ents">
          @for (ent of entrepreneurships(); track ent.entrepreneurshipId) {
            <a class="ent-card" [routerLink]="'/entrepreneurships/' + ent.entrepreneurshipId">
              <div class="ent-card__img">
                <img [src]="imageService.getEntityImageUrl(ent, 'ENTREPRENEURSHIP', ent.entrepreneurshipId)"
                     alt="{{ ent.name }}" loading="lazy" />
              </div>
              <div class="ent-card__body">
                @if (ent.categoryName) {
                  <span class="ent-card__badge">{{ ent.categoryName }}</span>
                }
                <h3 class="ent-card__title">{{ ent.name }}</h3>
                <p class="ent-card__desc">{{ ent.description }}</p>
                <span class="ent-card__action">Ver emprendimiento &rarr;</span>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="empty">
          <i class="pi pi-briefcase"></i>
          <p>Próximamente podrás descubrir emprendimientos aquí</p>
        </div>
      }

      <div class="section-cta">
        <a class="btn-primary" routerLink="/entrepreneurships">Ver Todos los Emprendimientos</a>
      </div>
    </section>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          Impulsa tu <span class="hero-highlight">emprendimiento</span>
        </h1>
        <p class="hero-subtitle">
          La plataforma que conecta emprendedores, eventos y oportunidades.
        </p>
        <div class="hero-actions">
          <a class="hero-btn hero-btn--primary" routerLink="/events">Explorar Eventos</a>
          <a class="hero-btn hero-btn--ghost" routerLink="/entrepreneurships">Ver Emprendimientos</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">+500</span>
            <span class="hero-stat-label">Emprendedores</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">+50</span>
            <span class="hero-stat-label">Eventos</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">+200</span>
            <span class="hero-stat-label">Emprendimientos</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <a class="footer-logo" routerLink="/">Emprendia</a>
        <p class="footer-text">&copy; 2026 Emprendia. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    /* ===== CAROUSEL SECTION ===== */
    .carousel-section {
      background: var(--color-surface-alt);
      padding: var(--spacing-xl) var(--spacing-lg);
    }
    .carousel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-xxl);
      color: var(--color-text-muted);
    }
    .carousel-empty i { font-size: 48px; margin-bottom: var(--spacing-md); }

    /* ===== SLIDE CONTENT (template) ===== */
    .slide {
      display: flex;
      height: 100%;
      min-height: 480px;
      background: var(--color-surface);
      border-radius: inherit;
      overflow: hidden;
    }
    .slide__image {
      width: 55%;
      flex-shrink: 0;
      min-height: 100%;
      overflow: hidden;
    }
    .slide__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .slide:hover .slide__image img {
      transform: scale(1.04);
    }
    .slide__info {
      flex: 1;
      padding: var(--spacing-xxl) var(--spacing-xxl) var(--spacing-xxl) var(--spacing-xxl);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--spacing-md);
      min-width: 0;
    }
    .slide__badge {
      display: inline-block;
      align-self: flex-start;
      padding: 4px 12px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: 999px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      letter-spacing: 0.02em;
      margin: 0;
    }
    .slide__title {
      font-size: clamp(1.6rem, 2.8vw, 2.4rem);
      font-weight: 800;
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.12;
      letter-spacing: -0.03em;
    }
    .slide__meta {
      display: flex;
      gap: var(--spacing-lg);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      flex-wrap: wrap;
      margin: 0;
    }
    .slide__meta span { display: flex; align-items: center; gap: var(--spacing-xs); }
    .slide__desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .slide__btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 12px 28px;
      background: var(--color-primary);
      color: #fff;
      border-radius: 999px;
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      align-self: flex-start;
      transition: all 0.3s ease;
      margin-top: var(--spacing-xs);
    }
    .slide__btn:hover {
      background: var(--color-primary-dark);
      gap: var(--spacing-md);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    /* ===== EMPRENDIMIENTOS ===== */
    .section {
      padding: var(--spacing-xxl) var(--spacing-lg);
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .section-title {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }
    .section-subtitle {
      color: var(--color-text-secondary);
      margin: var(--spacing-sm) 0 0;
      font-size: var(--font-size-md);
    }
    .section-cta {
      text-align: center;
      margin-top: var(--spacing-xl);
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      padding: 12px 24px;
      background: var(--color-primary);
      color: #fff;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      transition: background var(--transition-fast);
    }
    .btn-primary:hover { background: var(--color-primary-dark); }

    .ents {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }
    .ent-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-xl);
      overflow: hidden;
      text-decoration: none;
      background: var(--color-surface);
      transition: all 0.3s ease;
      border: 1px solid var(--color-border);
    }
    .ent-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
      border-color: transparent;
    }
    .ent-card__img {
      height: 200px;
      overflow: hidden;
    }
    .ent-card__img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .ent-card:hover .ent-card__img img { transform: scale(1.05); }
    .ent-card__body {
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      flex: 1;
    }
    .ent-card__badge {
      display: inline-block;
      align-self: flex-start;
      padding: 4px 10px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: 999px;
      font-size: var(--font-size-xs);
      font-weight: 600;
    }
    .ent-card__title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
    .ent-card__desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    .ent-card__action {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-primary);
      margin-top: var(--spacing-sm);
    }
    .ent-card:hover .ent-card__action { color: var(--color-primary-dark); }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-xxl);
      color: var(--color-text-muted);
    }
    .empty i { font-size: 48px; margin-bottom: var(--spacing-md); opacity: 0.4; }

    /* ===== HERO ===== */
    .hero {
      position: relative;
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-light) 100%);
      z-index: 0;
    }
    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: var(--spacing-xxl);
      max-width: 800px;
    }
    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 800;
      color: #fff;
      margin: 0 0 var(--spacing-md);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .hero-highlight {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      color: rgba(255,255,255,0.8);
      margin: 0 auto var(--spacing-xl);
      max-width: 500px;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }
    .hero-btn {
      padding: 14px 32px;
      border-radius: 999px;
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .hero-btn--primary {
      background: #fff;
      color: var(--color-primary);
    }
    .hero-btn--primary:hover {
      background: rgba(255,255,255,0.9);
      transform: translateY(-2px);
    }
    .hero-btn--ghost {
      background: transparent;
      border: 2px solid rgba(255,255,255,0.3);
      color: #fff;
    }
    .hero-btn--ghost:hover {
      border-color: #fff;
      background: rgba(255,255,255,0.1);
    }
    .hero-stats {
      display: flex;
      gap: var(--spacing-xxl);
      justify-content: center;
      margin-top: var(--spacing-xxl);
      flex-wrap: wrap;
    }
    .hero-stat { display: flex; flex-direction: column; align-items: center; }
    .hero-stat-value {
      font-size: var(--font-size-xxl);
      font-weight: 800;
      color: #fff;
    }
    .hero-stat-label {
      font-size: var(--font-size-sm);
      color: rgba(255,255,255,0.6);
    }

    .footer {
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      padding: var(--spacing-lg);
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
    .footer-logo {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
    }
    .footer-text {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    @media (max-width: 768px) {
      .slide {
        flex-direction: column;
        min-height: auto;
      }
      .slide__image {
        width: 100%;
        min-height: 220px;
        max-height: 260px;
      }
      .slide__info { padding: var(--spacing-lg); gap: var(--spacing-sm); }
      .slide__title { font-size: 1.4rem; }
      .ents { grid-template-columns: 1fr; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);

  readonly events = signal<Event[]>([]);
  readonly entrepreneurships = signal<Entrepreneurship[]>([]);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadEvents(),
      this.loadEntrepreneurships(),
    ]);
  }

  private async loadEvents(): Promise<void> {
    try {
      const results = await lastValueFrom(this.eventService.search({ page: 0, size: 20 }));
      if (results && results.length > 0) {
        this.events.set(results);
      }
    } catch {
      // fallback
    }
  }

  private async loadEntrepreneurships(): Promise<void> {
    try {
      const results = await lastValueFrom(this.entrepreneurshipService.search({ page: 0, size: 15 }));
      if (results && results.length > 0) {
        this.entrepreneurships.set(results);
      }
    } catch {
      // fallback
    }
  }
}
