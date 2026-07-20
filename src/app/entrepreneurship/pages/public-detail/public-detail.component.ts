import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import type { Entrepreneurship } from '../../models/entrepreneurship';
import type { EntrepreneurshipLocation } from '../../models/entrepreneurship-location';
import type { EntitySocialLink } from '../../models/entrepreneurship-social-link';
import type { EntityPortal } from '../../models/entrepreneurship-portal';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';

function fmt(d: string | Date, pattern = "d 'de' MMMM 'de' yyyy"): string {
  return format(typeof d === 'string' ? parseISO(d) : d, pattern, { locale: es });
}

@Component({
  selector: 'app-entrepreneurship-public-detail',
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    @if (entrepreneurship(); as e) {
      <!-- ===== HERO ===== -->
      <div class="hero">
        <img [src]="coverUrl() || imageService.getEntityImageUrl(e, 'ENTREPRENEURSHIP', e.entrepreneurshipId)"
             alt="{{ e.name }}" class="hero-img" />
        @if (isAppContext) {
          <div class="hero__actions" appClickOutside (appClickOutside)="coverMenuOpen.set(false)">
            <button class="hero__menu-btn" (click)="toggleCoverMenu()"><i class="pi pi-ellipsis-v"></i></button>
            @if (coverMenuOpen()) {
              <div class="hero__dropdown">
                <button class="hero__dropdown-item" (click)="openCoverPicker()"><i class="pi pi-image"></i> Editar portada</button>
              </div>
            }
          </div>
        }
        <input #coverInput type="file" accept="image/*" (change)="onCoverSelected($event)" style="display:none" />
        <div class="hero-overlay">
          <div class="hero-content">
            @if (e.categoryName) {
              <span class="hero-chip">{{ e.categoryName }}</span>
            }
            <h1 class="hero-title">{{ e.name }}</h1>
            <div class="hero-stats">
              <span><i class="pi pi-tag"></i> {{ typeDisplay() }}</span>
              @if (locations().length > 0) {
                <span><i class="pi pi-map-marker"></i> {{ locationDisplay() }}</span>
              }
              <span><i class="pi pi-calendar"></i> {{ createdAtDisplay() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== CONTENT ===== -->
      <div class="page">

        <!-- ===== ABOUT ===== -->
        @if (e.description) {
          <section class="card card--about">
            <div class="card__accent"></div>
            <div class="card__header">
              <i class="pi pi-info-circle"></i>
              <h2 class="card__title">Acerca del emprendimiento</h2>
            </div>
            <p class="card__text">{{ e.description }}</p>
          </section>
        }

        <!-- ===== 2-COLUMN COLLAPSIBLE SECTIONS ===== -->
        <div class="sections-grid">

          <!-- Información general -->
          <section class="card card--collapsible"
                   [class.card--open]="expandedSections().has('info')">
            <button class="card__trigger" (click)="toggleSection('info')">
              <i class="pi pi-info"></i>
              <span class="card__trigger-title">Información general</span>
              <i class="pi pi-chevron-down card__chevron"></i>
            </button>
            @if (expandedSections().has('info')) {
              <div class="card__body">
                <div class="info-list">
                  @if (e.categoryName) {
                    <div class="info-row">
                      <span class="info-row__label">Categoría</span>
                      <span class="info-row__value">{{ e.categoryName }}</span>
                    </div>
                    <div class="info-row__divider"></div>
                  }
                  <div class="info-row">
                    <span class="info-row__label">Tipo</span>
                    <span class="info-row__value">{{ typeDisplay() }}</span>
                  </div>
                  <div class="info-row__divider"></div>
                  <div class="info-row">
                    <span class="info-row__label">Miembro desde</span>
                    <span class="info-row__value">{{ createdAtDisplay() }}</span>
                  </div>
                </div>
              </div>
            }
          </section>

          <!-- Ubicaciones -->
          <section class="card card--collapsible"
                   [class.card--open]="expandedSections().has('ubicaciones')">
            <button class="card__trigger" (click)="toggleSection('ubicaciones')">
              <i class="pi pi-map-marker"></i>
              <span class="card__trigger-title">Ubicaciones</span>
              @if (locations().length > 0) {
                <span class="card__badge--sm">{{ locations().length }}</span>
              }
              <i class="pi pi-chevron-down card__chevron"></i>
            </button>
            @if (expandedSections().has('ubicaciones')) {
              <div class="card__body">
                @if (locations().length === 0) {
                  <span class="card__text">Sin ubicaciones registradas</span>
                } @else {
                  <div class="location-list">
                    @for (loc of locations(); track loc.entrepreneurshipLocationId) {
                      <div class="location-card">
                        <div class="location-card__header">
                          <i class="pi pi-map"></i>
                          <strong>{{ loc.addressLine }}</strong>
                        </div>
                        <div class="location-card__details">
                          @if (loc.cityName || loc.provinceName || loc.countryName) {
                            <span>{{ [loc.cityName, loc.provinceName, loc.countryName].filter(b => b).join(', ') }}</span>
                          }
                          @if (loc.latitude != null && loc.longitude != null) {
                            <span class="location-card__coords">{{ loc.latitude }}, {{ loc.longitude }}</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </section>

          <!-- Redes sociales -->
          @if (socialLinks().length > 0) {
            <section class="card card--collapsible"
                     [class.card--open]="expandedSections().has('sociales')">
              <button class="card__trigger" (click)="toggleSection('sociales')">
                <i class="pi pi-share-alt"></i>
                <span class="card__trigger-title">Redes sociales</span>
                <span class="card__badge--sm">{{ socialLinks().length }}</span>
                <i class="pi pi-chevron-down card__chevron"></i>
              </button>
              @if (expandedSections().has('sociales')) {
                <div class="card__body">
                  <div class="social-list">
                    @for (link of socialLinks(); track link.entitySocialLinkId) {
                      <a class="social-link" [href]="link.url" target="_blank" rel="noopener noreferrer">
                        <i class="pi pi-external-link"></i>
                        <span>{{ link.socialPlatformName || 'Red social' }}</span>
                      </a>
                    }
                  </div>
                </div>
              }
            </section>
          }

          <!-- Portal -->
          @if (portal(); as p) {
            <section class="card card--collapsible"
                     [class.card--open]="expandedSections().has('portal')">
              <button class="card__trigger" (click)="toggleSection('portal')">
                <i class="pi pi-globe"></i>
                <span class="card__trigger-title">Portal web</span>
                <i class="pi pi-chevron-down card__chevron"></i>
              </button>
              @if (expandedSections().has('portal')) {
                <div class="card__body">
                  <div class="info-list">
                    @if (p.subdomain) {
                      <div class="info-row">
                        <span class="info-row__label">Subdominio</span>
                        <span class="info-row__value">{{ p.subdomain }}.emprendia.com</span>
                      </div>
                      <div class="info-row__divider"></div>
                    }
                    @if (p.themeName) {
                      <div class="info-row">
                        <span class="info-row__label">Tema</span>
                        <span class="info-row__value">{{ p.themeName }}</span>
                      </div>
                      <div class="info-row__divider"></div>
                    }
                    <div class="info-row">
                      <span class="info-row__label">Estado</span>
                      <span class="info-row__value" [class.info-row__value--free]="p.isActive"
                            [class.info-row__value--paid]="!p.isActive">
                        {{ p.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </section>
          }

        </div>

        <!-- ===== GALLERY ===== -->
        @if (galleryImages().length > 0) {
          <section class="gallery-section">
            <div class="gallery-section__inner">
              <div class="gallery-section__header">
                <i class="pi pi-images"></i>
                <h2 class="gallery-section__title">Galería</h2>
                <span class="gallery-section__count">{{ galleryImages().length }} fotos</span>
              </div>
              <div class="gallery-section__carousel" #carousel>
                @for (img of galleryImages(); track img.imageId) {
                  <button class="gallery-section__slide" (click)="openGallery(img)">
                    <img [src]="img.imageUrl" [alt]="img.altText || ''" loading="lazy" />
                  </button>
                }
              </div>
              @if (galleryImages().length > 2) {
                <button class="gallery-section__arrow gallery-section__arrow--left" (click)="scrollGallery(-1)">
                  <i class="pi pi-chevron-left"></i>
                </button>
                <button class="gallery-section__arrow gallery-section__arrow--right" (click)="scrollGallery(1)">
                  <i class="pi pi-chevron-right"></i>
                </button>
              }
            </div>
          </section>
        }
      </div>

      <!-- ===== LIGHTBOX ===== -->
      @if (selectedImage(); as img) {
        <div class="lightbox" (click)="closeGallery()">
          <button class="lightbox__close" (click)="closeGallery()"><i class="pi pi-times"></i></button>
          @if (galleryIdx() > 0) {
            <button class="lightbox__nav lightbox__nav--prev" (click)="prevImage(); $event.stopPropagation()">
              <i class="pi pi-chevron-left"></i>
            </button>
          }
          <img [src]="img.imageUrl" [alt]="img.altText || ''" class="lightbox__img" (click)="$event.stopPropagation()" />
          @if (galleryIdx() < galleryImages().length - 1) {
            <button class="lightbox__nav lightbox__nav--next" (click)="nextImage(); $event.stopPropagation()">
              <i class="pi pi-chevron-right"></i>
            </button>
          }
          <div class="lightbox__counter">{{ galleryIdx() + 1 }} / {{ galleryImages().length }}</div>
        </div>
      }
    }

    @if (coverUploading()) {
      <div class="cover-uploading-overlay">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Actualizando portada...</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    /* ===== HERO ===== */
    .hero {
      position: relative; width: 100%; height: 520px; overflow: hidden;
    }
    .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 50%, transparent 100%);
      display: flex; align-items: flex-end; padding: var(--spacing-xxl) var(--spacing-xxl);
    }
    .hero-content { max-width: 1200px; width: 100%; margin: 0 auto; }
    .hero-chip {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
      background: var(--color-primary); color: #fff; border-radius: 999px;
      font-size: var(--font-size-xs); font-weight: 600; margin-bottom: var(--spacing-md);
      letter-spacing: 0.3px;
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; color: #fff;
      margin: 0 0 var(--spacing-md); line-height: 1.1; letter-spacing: -0.02em;
    }
    .hero-stats {
      display: flex; flex-wrap: wrap; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);
      color: rgba(255,255,255,0.85); font-size: var(--font-size-sm);
      i { margin-right: 6px; font-size: 13px; }
    }
    .hero__actions { position: absolute; top: var(--spacing-md); right: var(--spacing-md); z-index: 10; }
    .hero__menu-btn {
      width: 36px; height: 36px; border: none; border-radius: var(--radius-md);
      background: rgba(0,0,0,0.5); color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; opacity: 0; transition: opacity var(--transition-fast), background var(--transition-fast);
      .hero:hover & { opacity: 1; }
      &:hover { background: rgba(0,0,0,0.7); }
    }
    .hero__dropdown {
      position: absolute; top: 100%; right: 0; margin-top: 4px;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
      min-width: 200px; overflow: hidden; z-index: 20; animation: fadeIn 0.15s ease;
    }
    .hero__dropdown-item {
      display: flex; align-items: center; gap: var(--spacing-sm);
      width: 100%; padding: 10px 14px; border: none; background: none;
      color: var(--color-text-primary); font-size: var(--font-size-sm);
      cursor: pointer; transition: background var(--transition-fast); text-align: left;
      i { font-size: 14px; width: 16px; }
      &:hover { background: var(--color-surface-alt); }
    }

    /* ===== PAGE ===== */
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    /* ===== CARD ===== */
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      transition: box-shadow var(--transition-fast);
      &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    }
    .card--about {
      padding-left: calc(var(--spacing-xl) + 56px);
      position: relative;
      overflow: hidden;
    }
    .card--about .card__accent {
      position: absolute; top: 0; left: 0;
      width: 4px; height: 100%;
      background: var(--color-primary);
      border-radius: 0 4px 4px 0;
    }
    .card__header {
      display: flex; align-items: center; gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      i { font-size: 20px; color: var(--color-primary); }
    }
    .card__title {
      font-size: var(--font-size-lg); font-weight: 700;
      color: var(--color-text-primary); margin: 0; flex: 1;
    }
    .card__text {
      font-size: var(--font-size-md); color: var(--color-text-secondary);
      line-height: 1.8; margin: 0; white-space: pre-line;
    }
    .card__badge--sm {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px;
      background: var(--color-primary-light); color: var(--color-primary);
      font-size: 10px; font-weight: 700;
    }

    /* -- Collapsible -- */
    .card--collapsible { padding: 0; }
    .card__trigger {
      display: flex; align-items: center; gap: var(--spacing-sm);
      width: 100%; padding: var(--spacing-md) var(--spacing-lg);
      border: none; background: none; cursor: pointer;
      color: var(--color-text-primary); font-size: var(--font-size-sm); font-weight: 600;
      text-align: left; transition: background var(--transition-fast);
      &:hover { background: var(--color-surface-alt); }
      i:first-child { font-size: 16px; color: var(--color-primary); }
    }
    .card__trigger-title { flex: 1; }
    .card__chevron {
      font-size: 14px; color: var(--color-text-muted);
      transition: transform var(--transition-fast);
      .card--open & { transform: rotate(180deg); }
    }
    .card__body {
      padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-lg);
      animation: slideDown 0.25s ease;
    }

    /* ===== SECTIONS GRID ===== */
    .sections-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); align-items: start;
    }

    /* ===== INFO LIST ===== */
    .info-list { display: flex; flex-direction: column; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--spacing-sm) 0; gap: var(--spacing-lg);
    }
    .info-row__label {
      font-size: var(--font-size-xs); color: var(--color-text-muted); font-weight: 500; flex-shrink: 0;
    }
    .info-row__value {
      font-size: var(--font-size-sm); color: var(--color-text-primary);
      font-weight: 600; text-align: right; word-break: break-word; max-width: 60%;
    }
    .info-row__value--free { color: var(--color-success); }
    .info-row__value--paid { color: var(--color-primary); }
    .info-row__value--link {
      color: var(--color-primary); text-decoration: none; font-weight: 500;
      &:hover { text-decoration: underline; }
    }
    .info-row__divider { height: 1px; background: var(--color-border); opacity: 0.5; }

    /* ===== LOCATION LIST ===== */
    .location-list {
      display: flex; flex-direction: column; gap: var(--spacing-sm);
    }
    .location-card {
      padding: var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      transition: border-color var(--transition-fast);
      &:hover { border-color: var(--color-primary); }
    }
    .location-card__header {
      display: flex; align-items: center; gap: var(--spacing-sm);
      margin-bottom: 4px;
      i { font-size: 14px; color: var(--color-primary); }
      strong { font-size: var(--font-size-sm); color: var(--color-text-primary); }
    }
    .location-card__details {
      display: flex; flex-direction: column; gap: 2px;
      margin-left: calc(14px + var(--spacing-sm));
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .location-card__coords {
      font-family: monospace;
      color: var(--color-text-muted);
      font-size: 10px;
    }

    /* ===== SOCIAL LIST ===== */
    .social-list {
      display: flex; flex-wrap: wrap; gap: var(--spacing-sm);
    }
    .social-link {
      display: inline-flex; align-items: center; gap: var(--spacing-sm);
      padding: 8px 14px; border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary); text-decoration: none;
      font-size: var(--font-size-sm); font-weight: 500;
      transition: all var(--transition-fast);
      i { font-size: 13px; color: var(--color-primary); }
      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: var(--color-primary-light);
      }
    }

    /* ===== GALLERY SECTION ===== */
    .gallery-section {
      width: 100%;
      background: var(--color-surface-alt);
      padding: var(--spacing-xl) 0;
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }
    .gallery-section__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      position: relative;
    }
    .gallery-section__header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      i { font-size: 22px; color: var(--color-primary); }
    }
    .gallery-section__title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }
    .gallery-section__count {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-weight: 500;
    }
    .gallery-section__carousel {
      display: flex; gap: var(--spacing-md); overflow-x: auto;
      scroll-snap-type: x mandatory; scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch; padding-bottom: var(--spacing-sm);
      scrollbar-width: thin; scrollbar-color: var(--color-border) transparent;
      &::-webkit-scrollbar { height: 6px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
    }
    .gallery-section__slide {
      flex: 0 0 320px; scroll-snap-align: start;
      aspect-ratio: 16 / 10; border-radius: var(--radius-xl);
      overflow: hidden; border: none; padding: 0; cursor: pointer;
      position: relative; transition: transform var(--transition-fast);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .gallery-section__arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 40px; height: 40px; border: none; border-radius: 50%;
      background: var(--color-surface); color: var(--color-text-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; z-index: 2; transition: all var(--transition-fast);
      &:hover { background: var(--color-primary); color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
      &--left { left: calc(var(--spacing-lg) + 4px); }
      &--right { right: calc(var(--spacing-lg) + 4px); }
    }

    /* ===== LIGHTBOX ===== */
    .lightbox {
      position: fixed; inset: 0; z-index: 5000;
      background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .lightbox__img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    .lightbox__close {
      position: absolute; top: 20px; right: 20px; width: 44px; height: 44px;
      border: none; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff;
      font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast);
      &:hover { background: rgba(255,255,255,0.25); }
    }
    .lightbox__nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 50px; height: 50px; border: none; border-radius: 50%;
      background: rgba(255,255,255,0.1); color: #fff; font-size: 22px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast);
      &:hover { background: rgba(255,255,255,0.25); }
      &--prev { left: 20px; } &--next { right: 20px; }
    }
    .lightbox__counter {
      position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.6); color: #fff; padding: 6px 16px;
      border-radius: 999px; font-size: var(--font-size-sm); font-weight: 500;
    }

    /* ===== COVER UPLOADING ===== */
    .cover-uploading-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: var(--spacing-md); z-index: 2000;
      color: white; font-size: var(--font-size-lg);
      i { font-size: 36px; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .sections-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero { height: 340px; }
      .hero-overlay { padding: var(--spacing-lg); }
      .hero-stats { flex-direction: column; gap: var(--spacing-xs); }
      .page { padding: var(--spacing-lg); gap: var(--spacing-lg); }
      .card--about { padding-left: var(--spacing-xl); }
      .card--about .card__accent { display: none; }
      .info-row { flex-direction: column; align-items: flex-start; gap: 2px; }
      .info-row__value { text-align: left; max-width: 100%; }
      .gallery-section__slide { flex: 0 0 260px; }
      .gallery-section { padding: var(--spacing-lg) 0; }
      .lightbox__nav { width: 40px; height: 40px; font-size: 18px; }
      .lightbox__nav--prev { left: 10px; } .lightbox__nav--next { right: 10px; }
      .lightbox__img { max-width: 95vw; }
    }
  `],
})
export class PublicDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);
  private readonly authService = inject(AuthenticationService);

  get isAppContext(): boolean {
    return this.router.url.startsWith('/app');
  }

  readonly entrepreneurship = signal<Entrepreneurship | null>(null);
  readonly locations = signal<EntrepreneurshipLocation[]>([]);
  readonly socialLinks = signal<EntitySocialLink[]>([]);
  readonly portal = signal<EntityPortal | null>(null);
  readonly galleryImages = signal<ImageGallery[]>([]);

  readonly coverMenuOpen = signal(false);
  readonly coverUrl = signal<string | null>(null);
  readonly coverUploading = signal(false);

  readonly selectedImage = signal<ImageGallery | null>(null);
  readonly galleryIdx = signal(-1);

  readonly expandedSections = signal<Set<string>>(new Set(['info', 'ubicaciones', 'sociales', 'portal']));

  readonly typeDisplay = computed(() => {
    const e = this.entrepreneurship();
    if (!e) return '';
    return e.isPhysical && e.isDigital ? 'Físico y Digital'
         : e.isPhysical ? 'Físico'
         : 'Digital';
  });

  readonly locationDisplay = computed(() => {
    const locs = this.locations();
    if (locs.length === 0) return '';
    const loc = locs[0];
    return [loc.cityName, loc.provinceName, loc.countryName].filter(Boolean).join(', ');
  });

  readonly createdAtDisplay = computed(() => {
    const e = this.entrepreneurship();
    return e ? fmt(e.createdAt) : '';
  });

  @ViewChild('coverInput') private readonly coverInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('carousel') private readonly carouselRef!: ElementRef<HTMLElement>;

  private get entityId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit(): Promise<void> {
    const id = this.entityId;
    if (!id) return;
    await Promise.all([
      this.loadEntrepreneurship(id),
      this.loadGallery(id),
      this.loadLocations(id),
      this.loadSocialLinks(id),
      this.loadPortal(id),
    ]);
  }

  toggleSection(id: string): void {
    this.expandedSections.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  scrollGallery(dir: number): void {
    this.carouselRef?.nativeElement?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }

  private async loadEntrepreneurship(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getById(id));
      this.entrepreneurship.set(result);
    } catch {
      // fallback
    }
  }

  private async loadLocations(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getLocations(id));
      this.locations.set(result);
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

  private async loadPortal(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getPortal(id));
      if (result) this.portal.set(result);
    } catch {
      // fallback — no portal yet, that's fine
    }
  }

  private async loadGallery(id: number): Promise<void> {
    try {
      const images = await lastValueFrom(this.imageService.list('ENTREPRENEURSHIP', id));
      this.galleryImages.set(images.filter(img => img.displayOrder !== 0));
    } catch {
      // fallback
    }
  }

  openGallery(img: ImageGallery): void {
    const idx = this.galleryImages().findIndex(i => i.imageId === img.imageId);
    this.galleryIdx.set(idx);
    this.selectedImage.set(img);
  }

  closeGallery(): void {
    this.galleryIdx.set(-1);
    this.selectedImage.set(null);
  }

  nextImage(): void {
    const imgs = this.galleryImages();
    const idx = this.galleryIdx();
    if (idx < imgs.length - 1) {
      this.galleryIdx.set(idx + 1);
      this.selectedImage.set(imgs[idx + 1]);
    }
  }

  prevImage(): void {
    const imgs = this.galleryImages();
    const idx = this.galleryIdx();
    if (idx > 0) {
      this.galleryIdx.set(idx - 1);
      this.selectedImage.set(imgs[idx - 1]);
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

      const existingCovers = this.galleryImages().filter(i => i.displayOrder === 0 && i.imageId !== result.imageId);
      await Promise.all(
        existingCovers.map(img =>
          lastValueFrom(this.imageService.delete(img.imageId)).catch(() => {})
        )
      );

      this.imageService.invalidateCache('ENTREPRENEURSHIP', id);
      await Promise.all([
        this.loadGallery(id),
        this.loadEntrepreneurship(id),
      ]);
    } catch {
      // fallback
    } finally {
      this.coverUploading.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }
}
