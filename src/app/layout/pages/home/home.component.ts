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
    <!-- HERO -->
    <section class="hero home-hero">
      <div class="hero-bg"></div>
      <div class="hero-grid"></div>
      <div class="hero-glow hero-glow--one"></div>
      <div class="hero-glow hero-glow--two"></div>
      <div class="hero-content">
        <span class="hero-eyebrow">
          <span class="hero-eyebrow-dot"></span>
          Comunidad de innovación
        </span>
        <h1 class="hero-title">
          Impulsa tu <span class="hero-highlight">emprendimiento</span>
        </h1>
        <p class="hero-subtitle">
          La plataforma que conecta emprendedores, eventos y oportunidades.
        </p>
        <div class="hero-actions">
          <a class="hero-btn hero-btn--primary" routerLink="/events">
            Explorar Eventos <span class="hero-btn-arrow">&rarr;</span>
          </a>
          <a class="hero-btn hero-btn--ghost" routerLink="/entrepreneurships">
            Ver Emprendimientos
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">+500</span>
            <span class="hero-stat-label">Emprendedores</span>
          </div>
          <div class="hero-stat-sep"></div>
          <div class="hero-stat">
            <span class="hero-stat-value">+50</span>
            <span class="hero-stat-label">Eventos</span>
          </div>
          <div class="hero-stat-sep"></div>
          <div class="hero-stat">
            <span class="hero-stat-value">+200</span>
            <span class="hero-stat-label">Emprendimientos</span>
          </div>
        </div>
        <button class="hero-scroll" (click)="scrollToEvents()" aria-label="Desplazarse hacia abajo">
          <span class="hero-scroll-mouse"><span class="hero-scroll-wheel"></span></span>
          <span class="hero-scroll-label">Descubre</span>
        </button>
      </div>
    </section>

    <!-- EVENTOS DESTACADOS -->
    <section class="section events-section" id="eventos">
      <div class="section-header">
        <span class="section-kicker">Destacados</span>
        <h2 class="section-title">Próximos Eventos</h2>
        <p class="section-subtitle">Participa en eventos que impulsan tu red y tu negocio</p>
      </div>

      @if (loadingEvents()) {
        <div class="carousel-skeleton">
          <div class="carousel-skeleton__slide">
            <div class="carousel-skeleton__img skeleton"></div>
            <div class="carousel-skeleton__info">
              <div class="skeleton skeleton--chip"></div>
              <div class="skeleton skeleton--title skeleton--w-60"></div>
              <div class="skeleton skeleton--text"></div>
              <div class="skeleton skeleton--text skeleton--w-40"></div>
              <div class="skeleton skeleton--text skeleton--w-70"></div>
              <div class="skeleton skeleton--btn"></div>
            </div>
          </div>
        </div>
      } @else if (events().length > 0) {
        <app-hero-carousel [items]="events()" [template]="eventSlide" />
      } @else {
        <div class="carousel-empty">
          <i class="pi pi-calendar"></i>
          <p>No hay eventos próximos</p>
        </div>
      }

      <ng-template #eventSlide let-event>
        <div class="slide">
          <div class="slide__image">
            <img [src]="imageService.getEntityImageUrl(event, 'EVENT', event.eventId)" alt="{{ event.name }}" loading="lazy" />
            <div class="slide__image-shade"></div>
          </div>
          <div class="slide__info">
            <span class="slide__badge">{{ event.eventTypeName || 'Evento' }}</span>
            <h2 class="slide__title">{{ event.name }}</h2>
            <div class="slide__meta">
              <span><i class="pi pi-calendar"></i> {{ event.startDatetime | date:'longDate' }}</span>
              <span><i class="pi pi-map-marker"></i> {{ event.addressLine || event.cityName || 'Por definir' }}</span>
            </div>
            <p class="slide__desc">{{ event.description }}</p>
            <a class="slide__btn" [routerLink]="'/events/' + event.eventId">Ver Evento <span>&rarr;</span></a>
          </div>
        </div>
      </ng-template>
    </section>

    <!-- EMPRENDIMIENTOS -->
    <section class="section ents-section" id="emprendimientos">
      <div class="section-header">
        <span class="section-kicker">Comunidad</span>
        <h2 class="section-title">Emprendimientos Destacados</h2>
        <p class="section-subtitle">Explora los proyectos innovadores de nuestra comunidad</p>
      </div>

      @if (loadingEntrepreneurships()) {
        <div class="ents">
          @for (_ of [1,2,3]; track $index) {
            <div class="ent-card ent-card--skeleton">
              <div class="ent-card__img skeleton"></div>
              <div class="ent-card__body">
                <div class="skeleton skeleton--chip"></div>
                <div class="skeleton skeleton--title"></div>
                <div class="skeleton skeleton--text"></div>
                <div class="skeleton skeleton--text skeleton--w-40"></div>
                <div class="skeleton skeleton--text-sm"></div>
              </div>
            </div>
          }
        </div>
      } @else if (entrepreneurships().length > 0) {
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
                <span class="ent-card__action">Ver emprendimiento <span>&rarr;</span></span>
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

    <!-- BENEFICIOS -->
    <section class="features">
      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon"><i class="pi pi-briefcase"></i></div>
          <h3 class="feature-title">Conecta con emprendedores</h3>
          <p class="feature-text">Descubre proyectos innovadores y crea alianzas que aceleren tu crecimiento.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"><i class="pi pi-calendar-plus"></i></div>
          <h3 class="feature-title">Organiza y participa en eventos</h3>
          <p class="feature-text">Crea tu propio evento o únete a las actividades de la comunidad.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"><i class="pi pi-users"></i></div>
          <h3 class="feature-title">Amplía tu red profesional</h3>
          <p class="feature-text">Genera oportunidades y visibilidad para tu emprendimiento.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"><i class="pi pi-chart-line"></i></div>
          <h3 class="feature-title">Mide y crece</h3>
          <p class="feature-text">Accede a métricas y reportes que te ayudan a tomar mejores decisiones.</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-banner">
      <div class="cta-inner">
        <h2 class="cta-title">¿Listo para ser parte de la comunidad?</h2>
        <p class="cta-text">Crea tu cuenta y empieza a conectar con emprendedores y eventos hoy mismo.</p>
        <div class="cta-actions">
          <a class="cta-btn cta-btn--primary" routerLink="/register">Crear cuenta gratis</a>
          <a class="cta-btn cta-btn--ghost" routerLink="/app/dashboard">Explorar el panel</a>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <a class="footer-logo" routerLink="/">Emprendia</a>
        <div class="footer-links">
          <a routerLink="/events">Eventos</a>
          <a routerLink="/entrepreneurships">Emprendimientos</a>
          <a routerLink="/register">Registro</a>
        </div>
        <p class="footer-text">&copy; 2026 Emprendia. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    /* ===== SKELETON ===== */
    .skeleton {
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 400% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }
    .skeleton--chip { width: 80px; height: 24px; border-radius: 999px; }
    .skeleton--title { height: 28px; width: 80%; }
    .skeleton--text { height: 14px; width: 100%; margin: 4px 0; }
    .skeleton--text-sm { height: 12px; width: 50%; }
    .skeleton--w-40 { width: 40%; }
    .skeleton--w-60 { width: 60%; }
    .skeleton--w-70 { width: 70%; }
    .skeleton--btn { height: 44px; width: 150px; border-radius: 999px; }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* ===== HERO ===== */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      isolation: isolate;
      scroll-margin-top: 0;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: -3;
      background:
        radial-gradient(46% 55% at 82% 16%, color-mix(in srgb, var(--color-accent) 32%, transparent) 0%, transparent 55%),
        radial-gradient(60% 70% at 12% 88%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 62%),
        radial-gradient(50% 55% at 50% -25%, color-mix(in srgb, var(--color-primary-light) 75%, transparent) 0%, transparent 60%),
        linear-gradient(150deg, #fdfdff 0%, #f4f7ff 48%, #edf3ff 100%);
    }
    .hero-grid {
      position: absolute;
      inset: 0;
      z-index: -2;
      background-image:
        linear-gradient(color-mix(in srgb, var(--color-text-primary) 5%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--color-text-primary) 5%, transparent) 1px, transparent 1px);
      background-size: 56px 56px;
      -webkit-mask-image: radial-gradient(70% 70% at 50% 42%, #000 0%, transparent 100%);
      mask-image: radial-gradient(70% 70% at 50% 42%, #000 0%, transparent 100%);
    }
    .hero-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.55;
      z-index: -1;
      background: color-mix(in srgb, var(--color-primary) 30%, transparent);
      will-change: transform;
    }
    .hero-glow--one {
      width: 360px;
      height: 360px;
      top: -90px;
      left: -70px;
      animation: hero-float 10s ease-in-out infinite;
    }
    .hero-glow--two {
      width: 440px;
      height: 440px;
      bottom: -140px;
      right: -90px;
      background: color-mix(in srgb, var(--color-accent) 40%, transparent);
      animation: hero-float 13s ease-in-out infinite reverse;
    }
    @keyframes hero-float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-26px) scale(1.07); }
    }
    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: var(--spacing-xxl) var(--spacing-lg);
      max-width: 820px;
      animation: hero-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes hero-rise {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 6px 16px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: var(--spacing-lg);
    }
    .hero-eyebrow-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-accent);
      box-shadow: 0 0 12px var(--color-accent);
      animation: hero-pulse 2.2s ease-in-out infinite;
    }
    @keyframes hero-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
    .hero-title {
      font-size: clamp(2.6rem, 6vw, 4.2rem);
      font-weight: 800;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-md);
      line-height: 1.08;
      letter-spacing: -0.03em;
    }
    .hero-highlight {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      color: var(--color-text-secondary);
      margin: 0 auto var(--spacing-xl);
      max-width: 520px;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }
    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 14px 30px;
      border-radius: 999px;
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .hero-btn-arrow { transition: transform var(--transition-fast); }
    .hero-btn--primary {
      background: var(--color-primary);
      color: #fff;
      box-shadow: 0 10px 30px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }
    .hero-btn--primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
    }
    .hero-btn--primary:hover .hero-btn-arrow { transform: translateX(4px); }
    .hero-btn--ghost {
      background: transparent;
      border: 2px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
      color: var(--color-primary);
    }
    .hero-btn--ghost:hover {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      justify-content: center;
      margin-top: var(--spacing-xxl);
      flex-wrap: wrap;
    }
    .hero-stat { display: flex; flex-direction: column; align-items: center; min-width: 120px; }
    .hero-stat-value {
      font-size: var(--font-size-xxxl);
      font-weight: 800;
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
    }
    .hero-stat-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin-top: var(--spacing-xs);
    }
    .hero-stat-sep {
      width: 1px;
      height: 40px;
      background: var(--color-border);
    }
    .hero-scroll {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: max-content;
      margin: var(--spacing-lg) auto 0;
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      z-index: 2;
      transition: color var(--transition-fast);
    }
    .hero-scroll:hover { color: var(--color-text-primary); }
    .hero-scroll-mouse {
      width: 26px;
      height: 42px;
      border: 2px solid var(--color-border);
      border-radius: 999px;
      display: flex;
      justify-content: center;
      padding-top: 7px;
    }
    .hero-scroll-wheel {
      width: 4px;
      height: 9px;
      border-radius: 999px;
      background: var(--color-text-secondary);
      animation: scroll-wheel 1.9s ease-in-out infinite;
    }
    @keyframes scroll-wheel {
      0% { opacity: 0; transform: translateY(0); }
      30% { opacity: 1; }
      100% { opacity: 0; transform: translateY(13px); }
    }
    .hero-scroll-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      animation: scroll-fade 2s ease-in-out infinite;
    }
    @keyframes scroll-fade {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }

    /* ===== SECTIONS ===== */
    .section {
      padding: var(--spacing-xxl) var(--spacing-lg);
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .section-kicker {
      display: inline-block;
      padding: 4px 12px;
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
      border-radius: 999px;
      font-size: var(--font-size-xs);
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: var(--spacing-sm);
    }
    .section-title {
      font-size: var(--font-size-xxxl);
      font-weight: 800;
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
      padding: 12px 28px;
      background: var(--color-primary);
      color: #fff;
      border-radius: 999px;
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }
    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
    }

    /* ===== CAROUSEL SECTION ===== */
    .events-section {
      padding-top: var(--spacing-xxl);
      max-width: 1400px;
    }
    .carousel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-xxl);
      color: var(--color-text-muted);
    }
    .carousel-empty i { font-size: 48px; margin-bottom: var(--spacing-md); }

    .carousel-skeleton {
      max-width: 1200px;
      margin: 0 auto;
    }
    .carousel-skeleton__slide {
      display: flex;
      height: 400px;
      border-radius: var(--radius-xl);
      overflow: hidden;
    }
    .carousel-skeleton__img {
      width: 55%;
      flex-shrink: 0;
      border-radius: 0;
    }
    .carousel-skeleton__info {
      flex: 1;
      padding: var(--spacing-xxl);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--spacing-md);
    }

    /* ===== SLIDE CONTENT (template) ===== */
    .slide {
      display: flex;
      height: 100%;
      min-height: 360px;
      background: var(--color-surface);
      border-radius: inherit;
      overflow: hidden;
    }
    .slide__image {
      position: relative;
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
      transition: transform 0.5s ease;
    }
    .slide:hover .slide__image img {
      transform: scale(1.04);
    }
    .slide__image-shade {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 60%, color-mix(in srgb, var(--color-surface) 90%, transparent) 100%);
    }
    .slide__info {
      flex: 1;
      padding: var(--spacing-xxl);
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
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
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
    .slide__btn span { transition: transform 0.3s ease; }
    .slide__btn:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px color-mix(in srgb, var(--color-primary) 35%, transparent);
    }
    .slide__btn:hover span { transform: translateX(4px); }

    /* ===== EMPRENDIMIENTOS ===== */
    .ents-section { padding-bottom: var(--spacing-xxl); }
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
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
      border-color: color-mix(in srgb, var(--color-primary) 32%, var(--color-border));
    }
    .ent-card__img {
      height: 200px;
      overflow: hidden;
      position: relative;
    }
    .ent-card__img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .ent-card__img::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 45%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .ent-card:hover .ent-card__img img { transform: scale(1.05); }
    .ent-card:hover .ent-card__img::after { opacity: 1; }
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
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
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
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-primary);
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--color-border);
    }
    .ent-card__action span { transition: transform 0.3s ease; }
    .ent-card:hover .ent-card__action { color: var(--color-primary-dark); }
    .ent-card:hover .ent-card__action span { transform: translateX(4px); }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-xxl);
      color: var(--color-text-muted);
    }
    .empty i { font-size: 48px; margin-bottom: var(--spacing-md); opacity: 0.4; }

    /* ===== BENEFICIOS ===== */
    .features {
      background: var(--color-surface-alt);
      padding: var(--spacing-xxl) var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }
    .features-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-lg);
    }
    .feature {
      padding: var(--spacing-lg);
      border-radius: var(--radius-xl);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      transition: all 0.3s ease;
    }
    .feature:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }
    .feature-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
      font-size: 20px;
      margin-bottom: var(--spacing-md);
    }
    .feature-title {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs);
    }
    .feature-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    /* ===== CTA ===== */
    .cta-banner {
      max-width: 1200px;
      margin: var(--spacing-xxl) auto;
      padding: 0 var(--spacing-lg);
    }
    .cta-inner {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, color-mix(in srgb, var(--color-accent) 70%, var(--color-primary)) 130%);
      padding: var(--spacing-xxl);
      text-align: center;
    }
    .cta-title {
      font-size: clamp(1.6rem, 3.5vw, 2.4rem);
      font-weight: 800;
      color: #fff;
      margin: 0 0 var(--spacing-sm);
      letter-spacing: -0.02em;
    }
    .cta-text {
      color: rgba(255, 255, 255, 0.82);
      margin: 0 auto var(--spacing-lg);
      max-width: 520px;
      line-height: 1.6;
    }
    .cta-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      padding: 12px 28px;
      border-radius: 999px;
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .cta-btn--primary {
      background: #fff;
      color: var(--color-primary);
    }
    .cta-btn--primary:hover {
      background: rgba(255, 255, 255, 0.92);
      transform: translateY(-2px);
    }
    .cta-btn--ghost {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.32);
      color: #fff;
    }
    .cta-btn--ghost:hover {
      border-color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    /* ===== FOOTER ===== */
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
      gap: var(--spacing-md);
    }
    .footer-logo {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
    }
    .footer-links {
      display: flex;
      gap: var(--spacing-lg);
    }
    .footer-links a {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .footer-links a:hover { color: var(--color-primary); }
    .footer-text {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    @media (max-width: 768px) {
      .hero { min-height: 85vh; }
      .hero-stat-sep { display: none; }
      .hero-stats { gap: var(--spacing-lg); }
      .hero-scroll { margin: var(--spacing-md) auto 0; }
      .slide {
        flex-direction: column;
        min-height: auto;
      }
      .slide__image {
        width: 100%;
        min-height: 220px;
        max-height: 260px;
      }
      .slide__image-shade { display: none; }
      .slide__info { padding: var(--spacing-lg); gap: var(--spacing-sm); }
      .slide__title { font-size: 1.4rem; }
      .ents { grid-template-columns: 1fr; }
      .footer-inner { justify-content: center; text-align: center; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);

  readonly events = signal<Event[]>([]);
  readonly entrepreneurships = signal<Entrepreneurship[]>([]);
  readonly loadingEvents = signal(true);
  readonly loadingEntrepreneurships = signal(true);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadEvents(),
      this.loadEntrepreneurships(),
    ]);
  }

  private async loadEvents(): Promise<void> {
    this.loadingEvents.set(true);
    try {
      const results = await lastValueFrom(this.eventService.search({ page: 0, size: 20 }));
      if (results && results.length > 0) {
        this.events.set(results);
      }
    } catch {
      // fallback
    } finally {
      this.loadingEvents.set(false);
    }
  }

  private async loadEntrepreneurships(): Promise<void> {
    this.loadingEntrepreneurships.set(true);
    try {
      const results = await lastValueFrom(this.entrepreneurshipService.search({ page: 0, size: 6 }));
      if (results && results.length > 0) {
        this.entrepreneurships.set(results);
      }
    } catch {
      // fallback
    } finally {
      this.loadingEntrepreneurships.set(false);
    }
  }

  scrollToEvents(): void {
    document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' });
  }
}
