import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../services/event.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import type { Event } from '../../models/event';
import type { EventParticipant } from '../../models/event-invitation';

@Component({
  selector: 'app-event-public-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ClickOutsideDirective],
  template: `
    @if (event(); as e) {
      <div class="hero">
        <img [src]="imageService.getEntityImageUrl(e, 'EVENT', e.eventId)"
             alt="{{ e.name }}" class="hero-img" />
        @if (isAppContext) {
          <div class="hero__actions" appClickOutside (appClickOutside)="coverMenuOpen.set(false)">
            <button class="hero__menu-btn" (click)="toggleCoverMenu()" aria-label="Opciones de portada">
              <i class="pi pi-ellipsis-v"></i>
            </button>
            @if (coverMenuOpen()) {
              <div class="hero__dropdown">
                <button class="hero__dropdown-item" (click)="openCoverPicker()">
                  <i class="pi pi-image"></i> Editar imagen de portada
                </button>
              </div>
            }
          </div>
        }
        <input #coverInput type="file" accept="image/*" (change)="onCoverSelected($event)" style="display: none" />
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

    @if (uploadingCover()) {
      <div class="cover-uploading-overlay">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Actualizando portada...</span>
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

    .hero__actions {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      z-index: 10;
    }

    .hero__menu-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-md);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      opacity: 0;
      transition: opacity var(--transition-fast), background var(--transition-fast);

      .hero:hover & {
        opacity: 1;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }

    .hero__dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      min-width: 200px;
      overflow: hidden;
      z-index: 20;
      animation: fadeIn 0.15s ease;
    }

    .hero__dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: 10px 14px;
      border: none;
      background: none;
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: background var(--transition-fast);
      text-align: left;

      i {
        font-size: 14px;
        width: 16px;
      }

      &:hover {
        background: var(--color-surface-alt);
      }
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

    .cover-uploading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      z-index: 2000;
      color: white;
      font-size: var(--font-size-lg);
    }
    .cover-uploading-overlay i { font-size: 36px; }

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
  private readonly authService = inject(AuthenticationService);
  readonly imageService = inject(ImageService);

  get isAppContext(): boolean {
    return this.router.url.startsWith('/app');
  }
  readonly event = signal<Event | null>(null);
  readonly participants = signal<EventParticipant[]>([]);
  readonly coverMenuOpen = signal(false);
  readonly uploadingCover = signal(false);

  @ViewChild('coverInput') coverInputRef!: ElementRef<HTMLInputElement>;

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

  toggleCoverMenu(): void {
    this.coverMenuOpen.update(v => !v);
  }

  openCoverPicker(): void {
    this.coverMenuOpen.set(false);
    this.coverInputRef.nativeElement.click();
  }

  async onCoverSelected(evt: any): Promise<void> {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const ev = this.event();
    if (!ev) return;

    this.uploadingCover.set(true);
    try {
      const images = await lastValueFrom(this.imageService.list('EVENT', ev.eventId));
      const oldCovers = images.filter(img => img.displayOrder === 0);

      const uploadResult = await lastValueFrom(this.imageService.upload(
        file,
        'EVENT',
        ev.eventId,
        0,
        'Portada de ' + ev.name,
        this.authService.backendUserId() ?? undefined,
      ));

      for (const old of oldCovers) {
        try {
          await lastValueFrom(this.imageService.delete(old.imageId, 'EVENT', ev.eventId));
        } catch { /* ignore */ }
      }

      this.imageService.invalidateCache('EVENT', ev.eventId);
      await this.loadEvent(ev.eventId);
    } catch (err) {
      console.error('Error updating cover:', err);
    } finally {
      this.uploadingCover.set(false);
    }
  }
}
