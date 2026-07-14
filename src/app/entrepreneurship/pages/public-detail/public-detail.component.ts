import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import type { Entrepreneurship } from '../../models/entrepreneurship';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { EntrepreneurshipLocation } from '../../models/entrepreneurship-location';
import type { EntrepreneurshipSocialLink } from '../../models/entrepreneurship-social-link';

@Component({
  selector: 'app-entrepreneurship-public-detail',
  standalone: true,
  imports: [DatePipe, ClickOutsideDirective],
  template: `
    @if (entrepreneurship(); as e) {
      <div class="hero">
        <img [src]="coverUrl() || imageService.getEntityImageUrl(e, 'ENTREPRENEURSHIP', e.entrepreneurshipId)"
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
          <h3 class="sidebar-title">Galería de imágenes</h3>
          @if (isAppContext) {
            <div class="gallery-actions">
              <button class="btn btn--outline btn--sm" (click)="openGalleryUpload()">
                <i class="pi pi-plus"></i> Agregar imagen
              </button>
            </div>
            <input #galleryInput type="file" accept="image/*" multiple (change)="onGalleryFilesSelected($event)" style="display: none" />
          }
          @if (uploading()) {
            <div class="uploading-overlay">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Subiendo imágenes...</span>
            </div>
          }
          @if (images().length > 0) {
            <div class="gallery">
              @for (img of images(); track img.imageId) {
                <div class="gallery-item-wrapper">
                  <img [src]="img.imageUrl" [alt]="img.altText || e.name"
                       class="gallery-item" loading="lazy" (click)="selectImage(img)" />
                  @if (isAppContext) {
                    <button class="gallery-item__delete" (click)="deleteImage(img); $event.stopPropagation()"
                            [disabled]="deletingImageId() === img.imageId" aria-label="Eliminar imagen">
                      @if (deletingImageId() === img.imageId) {
                        <i class="pi pi-spin pi-spinner"></i>
                      } @else {
                        <i class="pi pi-trash"></i>
                      }
                    </button>
                  }
                </div>
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

      @if (selectedImage(); as img) {
        <div class="lightbox" (click)="selectedImage.set(null)">
          <img [src]="img.imageUrl" [alt]="img.altText || 'Imagen'" class="lightbox-img" />
          <button class="lightbox-close" (click)="selectedImage.set(null); $event.stopPropagation()">
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
    }

    @if (coverUploading()) {
      <div class="cover-loading">
        <i class="pi pi-spin pi-spinner"></i>
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
      background: rgba(0,0,0,0.5);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background var(--transition-fast);
    }
    .hero__menu-btn:hover { background: rgba(0,0,0,0.7); }
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
    }
    .hero__dropdown-item i { font-size: 14px; width: 16px; }
    .hero__dropdown-item:hover { background: var(--color-surface-alt); }

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

    .cover-loading {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .cover-loading i { font-size: 48px; color: #fff; }

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

    .gallery-actions {
      margin-bottom: var(--spacing-md);
    }

    .gallery {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    .gallery-item-wrapper {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .gallery-item {
      width: 100%;
      border-radius: var(--radius-lg);
      object-fit: cover;
      max-height: 220px;
      transition: opacity var(--transition-fast);
      cursor: pointer;
      display: block;
    }
    .gallery-item:hover { opacity: 0.85; }
    .gallery-item__delete {
      position: absolute;
      top: var(--spacing-xs);
      right: var(--spacing-xs);
      width: 28px;
      height: 28px;
      border: none;
      border-radius: var(--radius-sm);
      background: rgba(239,68,68,0.85);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
    .gallery-item-wrapper:hover .gallery-item__delete { opacity: 1; }
    .gallery-item__delete:disabled { opacity: 0.5; cursor: not-allowed; }

    .uploading-overlay {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--color-surface-alt);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
    .uploading-overlay i { color: var(--color-primary); }

    .empty { padding: 0; }
    .empty .gallery-item { max-height: 300px; }

    .lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      cursor: pointer;
    }
    .lightbox-img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }
    .lightbox-close {
      position: fixed;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      width: 44px;
      height: 44px;
      border: none;
      border-radius: var(--radius-md);
      background: rgba(0,0,0,0.6);
      color: #fff;
      font-size: 22px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast);
    }
    .lightbox-close:hover { background: rgba(0,0,0,0.8); }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .hero { height: 280px; }
      .layout { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PublicDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);
  private readonly authService = inject(AuthenticationService);

  @ViewChild('coverInput') private readonly coverInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') private readonly galleryInputRef!: ElementRef<HTMLInputElement>;

  readonly entrepreneurship = signal<Entrepreneurship | null>(null);
  readonly images = signal<ImageGallery[]>([]);
  readonly location = signal<EntrepreneurshipLocation | null>(null);
  readonly socialLinks = signal<EntrepreneurshipSocialLink[]>([]);

  readonly coverMenuOpen = signal(false);
  readonly coverUrl = signal<string | null>(null);
  readonly coverUploading = signal(false);
  readonly uploading = signal(false);
  readonly deletingImageId = signal<number | null>(null);
  readonly selectedImage = signal<ImageGallery | null>(null);

  get isAppContext(): boolean {
    return this.router.url.startsWith('/app');
  }

  private get entityId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit(): Promise<void> {
    const id = this.entityId;
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

  toggleCoverMenu(): void {
    this.coverMenuOpen.update(v => !v);
  }

  openCoverPicker(): void {
    this.coverMenuOpen.set(false);
    this.coverInputRef.nativeElement.click();
  }

  async onCoverSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const id = this.entityId;
    this.coverUploading.set(true);

    try {
      const result = await lastValueFrom(
        this.imageService.upload(file, 'ENTREPRENEURSHIP', id, 0, undefined, this.authService.backendUserId() ?? undefined)
      );
      this.coverUrl.set(result.imageUrl);

      const existingCovers = this.images().filter(i => i.displayOrder === 0 && i.imageId !== result.imageId);
      await Promise.all(
        existingCovers.map(img =>
          lastValueFrom(this.imageService.delete(img.imageId)).catch(() => {})
        )
      );

      this.imageService.invalidateCache('ENTREPRENEURSHIP', id);
      await this.loadImages(id);
    } catch {
      // fallback
    } finally {
      this.coverUploading.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }

  openGalleryUpload(): void {
    this.galleryInputRef.nativeElement.click();
  }

  async onGalleryFilesSelected(event: Event): Promise<void> {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const id = this.entityId;
    const userId = this.authService.backendUserId();
    this.uploading.set(true);

    try {
      const nextOrder = this.images().length > 0
        ? Math.max(...this.images().map(i => i.displayOrder)) + 1
        : 1;

      await Promise.all(
        Array.from(files).map((file, index) =>
          lastValueFrom(this.imageService.upload(file, 'ENTREPRENEURSHIP', id, nextOrder + index, undefined, userId ?? undefined))
        )
      );

      this.imageService.invalidateCache('ENTREPRENEURSHIP', id);
      await this.loadImages(id);
    } catch {
      // fallback
    } finally {
      this.uploading.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }

  async deleteImage(img: ImageGallery): Promise<void> {
    this.deletingImageId.set(img.imageId);
    try {
      await lastValueFrom(this.imageService.delete(img.imageId));
      this.imageService.invalidateCache('ENTREPRENEURSHIP', this.entityId);
      await this.loadImages(this.entityId);
    } catch {
      // fallback
    } finally {
      this.deletingImageId.set(null);
    }
  }

  selectImage(img: ImageGallery): void {
    this.selectedImage.set(img);
  }
}
