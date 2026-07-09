import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../services/event.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import type { Event } from '../../models/event';
import type { EventParticipant } from '../../models/event-invitation';

@Component({
  selector: 'app-event-public-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (event(); as e) {
      <div class="hero">
        <img [src]="imageService.getEntityImageUrl(e, 'EVENT', e.eventId)"
             alt="{{ e.name }}" class="hero-img" />
        <div class="hero-overlay">
          <div class="hero-content">
            <span class="hero-chip">{{ e.eventTypeName || 'Evento' }}</span>
            <h1 class="hero-title">{{ e.name }}</h1>
            @if (e.organizerName) {
              <p class="hero-meta"><i class="pi pi-building"></i> {{ e.organizerName }}</p>
            }
          </div>
        </div>
      </div>

      <div class="layout">
        <main class="main">
          <section class="section">
            <h2 class="section-title">{{ e.name }}</h2>
            <div class="detail-grid">
              @if (e.organizerName) {
                <div class="detail-item">
                  <span class="detail-label">Organizado por</span>
                  <span class="detail-value">{{ e.organizerName }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="detail-label">Fecha y hora</span>
                <span class="detail-value">{{ e.startDatetime | date:'fullDate' }} · {{ e.startDatetime | date:'shortTime' }}</span>
              </div>
              @if (e.cityName || e.addressLine) {
                <div class="detail-item">
                  <span class="detail-label">Lugar</span>
                  <span class="detail-value">{{ e.addressLine || e.cityName }}</span>
                </div>
              }
              @if (e.eventTypeName) {
                <div class="detail-item">
                  <span class="detail-label">Categoría</span>
                  <span class="detail-value">{{ e.eventTypeName }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="detail-label">Entrada</span>
                @if (e.isPaid && e.price) {
                  <span class="detail-value">\${{ e.price }}</span>
                } @else {
                  <span class="detail-value detail-value--free">Gratuito</span>
                }
              </div>
            </div>
          </section>

          <hr class="divider" />

          <section class="section">
            <h2 class="section-title">Acerca del evento</h2>
            <p class="description">{{ e.description }}</p>
          </section>
        </main>

        <aside class="sidebar">
          <h3 class="sidebar-title">Emprendimientos Participantes</h3>
          @if (participants().length > 0) {
            <div class="participants">
              @for (p of participants(); track p.entrepreneurshipId) {
                <a class="participant-card" [routerLink]="(isAppContext ? '/app' : '') + '/entrepreneurships/' + p.entrepreneurshipId">
                  <img [src]="imageService.getEntityImageUrl(
                    { imageUrl: p.entrepreneurshipImageUrl, imageId: p.entrepreneurshipImageId },
                    'ENTREPRENEURSHIP', p.entrepreneurshipId)"
                    alt="{{ p.entrepreneurshipName }}" class="participant-logo" />
                  <div class="participant-body">
                    <strong class="participant-name">{{ p.entrepreneurshipName }}</strong>
                    <span class="participant-meta">Ver emprendimiento &rarr;</span>
                  </div>
                </a>
              }
            </div>
          } @else {
            <div class="empty">
              <i class="pi pi-users"></i>
              <p>No hay emprendimientos participantes</p>
            </div>
          }
        </aside>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .hero {
      position: relative;
      width: 100%;
      height: 480px;
      overflow: hidden;
    }
    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
      display: flex;
      align-items: flex-end;
      padding: var(--spacing-xxl) var(--spacing-xxl);
    }
    .hero-content {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }
    .hero-chip {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      color: #fff;
      border-radius: 999px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      margin-bottom: var(--spacing-md);
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      color: #fff;
      margin: 0 0 var(--spacing-sm);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .hero-meta {
      color: rgba(255,255,255,0.8);
      font-size: var(--font-size-md);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: var(--spacing-xxl);
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-xxl) var(--spacing-lg);
    }

    .main { min-width: 0; }
    .section { padding: 0; }
    .section-title {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-lg);
      letter-spacing: -0.01em;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg) var(--spacing-xl);
    }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .detail-value {
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
      font-weight: 600;
    }
    .detail-value--free { color: var(--color-success); }

    .divider {
      border: none;
      height: 1px;
      background: var(--color-border);
      margin: var(--spacing-xxl) 0;
    }

    .description {
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
      line-height: 1.8;
      margin: 0;
      max-width: 680px;
      white-space: pre-line;
    }

    .sidebar { align-self: start; }
    .sidebar-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .participants { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .participant-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }
    .participant-card:hover {
      background: var(--color-surface-alt);
      border-color: var(--color-border);
    }
    .participant-logo {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      object-fit: cover;
      flex-shrink: 0;
    }
    .participant-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .participant-name {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .participant-meta {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      font-weight: 500;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-xxl) var(--spacing-lg);
      color: var(--color-text-muted);
      text-align: center;
    }
    .empty i { font-size: 36px; margin-bottom: var(--spacing-sm); opacity: 0.4; }
    .empty p { font-size: var(--font-size-sm); margin: 0; }

    @media (max-width: 768px) {
      .hero { height: 300px; }
      .layout { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PublicDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  readonly imageService = inject(ImageService);

  get isAppContext(): boolean {
    return this.router.url.startsWith('/app');
  }
  readonly event = signal<Event | null>(null);
  readonly participants = signal<EventParticipant[]>([]);

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    await Promise.all([
      this.loadEvent(id),
      this.loadParticipants(id),
    ]);
  }

  private async loadEvent(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.eventService.getById(id));
      this.event.set(result);
    } catch {
      // fallback
    }
  }

  private async loadParticipants(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.eventService.getParticipants(id));
      this.participants.set(result);
    } catch {
      // fallback
    }
  }
}
