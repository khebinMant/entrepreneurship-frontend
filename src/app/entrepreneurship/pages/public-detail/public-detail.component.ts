import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import type { Entrepreneurship } from '../../models/entrepreneurship';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { EntrepreneurshipLocation } from '../../models/entrepreneurship-location';
import type { EntrepreneurshipSocialLink } from '../../models/entrepreneurship-social-link';

@Component({
  selector: 'app-entrepreneurship-public-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (entrepreneurship(); as e) {
      <div class="hero">
        <img [src]="imageService.getEntityImageUrl(e, 'ENTREPRENEURSHIP', e.entrepreneurshipId)"
             alt="{{ e.name }}" class="hero-img" />
        <div class="hero-overlay">
          <div class="hero-content">
            @if (e.categoryName) {
              <span class="hero-chip">{{ e.categoryName }}</span>
            }
            <h1 class="hero-title">{{ e.name }}</h1>
            @if (location(); as loc) {
              <p class="hero-meta"><i class="pi pi-map-marker"></i> {{ loc.cityName }}{{ loc.countryName ? ', ' + loc.countryName : '' }}</p>
            }
          </div>
        </div>
      </div>

      <div class="layout">
        <main class="main">
          <section class="section">
            <h2 class="section-title">{{ e.name }}</h2>
            <div class="detail-grid">
              @if (e.categoryName) {
                <div class="detail-item">
                  <span class="detail-label">Categoría</span>
                  <span class="detail-value">{{ e.categoryName }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="detail-label">Tipo</span>
                <span class="detail-value">{{ e.isPhysical && e.isDigital ? 'Físico y Digital' : e.isPhysical ? 'Físico' : 'Digital' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Miembro desde</span>
                <span class="detail-value">{{ e.createdAt | date:'longDate' }}</span>
              </div>
            </div>
          </section>

          <hr class="divider" />

          <section class="section">
            <h2 class="section-title">Descripción</h2>
            <p class="description">{{ e.description }}</p>
          </section>

          @if (location(); as loc) {
            <hr class="divider" />
            <section class="section">
              <h2 class="section-title">Ubicación</h2>
              <div class="detail-grid">
                @if (loc.cityName) {
                  <div class="detail-item">
                    <span class="detail-label">Ciudad</span>
                    <span class="detail-value">{{ loc.cityName }}</span>
                  </div>
                }
                @if (loc.provinceName) {
                  <div class="detail-item">
                    <span class="detail-label">Provincia</span>
                    <span class="detail-value">{{ loc.provinceName }}</span>
                  </div>
                }
                @if (loc.countryName) {
                  <div class="detail-item">
                    <span class="detail-label">País</span>
                    <span class="detail-value">{{ loc.countryName }}</span>
                  </div>
                }
                @if (loc.addressLine) {
                  <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">Dirección</span>
                    <span class="detail-value">{{ loc.addressLine }}</span>
                  </div>
                }
              </div>
            </section>
          }

          @if (socialLinks().length > 0) {
            <hr class="divider" />
            <section class="section">
              <h2 class="section-title">Redes</h2>
              <div class="socials">
                @for (link of socialLinks(); track link.entrepreneurshipSocialLinkId) {
                  <a [href]="link.url" target="_blank" rel="noopener noreferrer" class="social-link">
                    <i class="pi pi-external-link"></i>
                    <span>{{ link.socialPlatformName || 'Red social' }}</span>
                  </a>
                }
              </div>
            </section>
          }
        </main>

        <aside class="sidebar">
          <h3 class="sidebar-title">Galería</h3>
          @if (images().length > 0) {
            <div class="gallery">
              @for (img of images(); track img.imageId) {
                <img [src]="img.imageUrl" [alt]="img.altText || e.name" class="gallery-item" loading="lazy" />
              }
            </div>
          } @else {
            <div class="empty">
              <img [src]="imageService.getDefaultImage('ENTREPRENEURSHIP', e.entrepreneurshipId)"
                   alt="Imagen por defecto" class="gallery-item" />
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
      height: 420px;
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
      font-size: clamp(2rem, 5vw, 3.2rem);
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

    .socials {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
    .social-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 10px 18px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: 500;
      transition: all var(--transition-fast);
    }
    .social-link:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
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

    .gallery {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    .gallery-item {
      width: 100%;
      border-radius: var(--radius-lg);
      object-fit: cover;
      max-height: 220px;
      transition: opacity var(--transition-fast);
      cursor: pointer;
    }
    .gallery-item:hover { opacity: 0.85; }

    .empty { padding: 0; }
    .empty .gallery-item { max-height: 300px; }

    @media (max-width: 768px) {
      .hero { height: 280px; }
      .layout { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PublicDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);

  readonly entrepreneurship = signal<Entrepreneurship | null>(null);
  readonly images = signal<ImageGallery[]>([]);
  readonly location = signal<EntrepreneurshipLocation | null>(null);
  readonly socialLinks = signal<EntrepreneurshipSocialLink[]>([]);

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    await Promise.all([
      this.loadEntrepreneurship(id),
      this.loadImages(id),
      this.loadLocation(id),
      this.loadSocialLinks(id),
    ]);
  }

  private async loadEntrepreneurship(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getById(id));
      this.entrepreneurship.set(result);
    } catch {
      // fallback
    }
  }

  private async loadImages(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.imageService.list('ENTREPRENEURSHIP', id));
      this.images.set(result);
    } catch {
      // fallback
    }
  }

  private async loadLocation(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getLocations(id));
      if (result.length > 0) {
        this.location.set(result[0]);
      }
    } catch {
      // fallback
    }
  }

  private async loadSocialLinks(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getSocialLinks(id));
      this.socialLinks.set(result);
    } catch {
      // fallback
    }
  }
}
