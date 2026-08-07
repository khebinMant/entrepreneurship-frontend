import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

import { lastValueFrom } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { PortalViewComponent } from '../../../shared/ui/portal-view/portal-view.component';
import { categoryChipClass } from '../../../shared/utils/category-colors';
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
  imports: [RouterLink, ClickOutsideDirective, PortalViewComponent, NgClass],
  template: `
    @if (loading()) {
      <div class="hero-skeleton">
        <div class="hero-skeleton__content">
          <div class="skeleton skeleton--chip"></div>
          <div class="skeleton skeleton--title skeleton--w-80"></div>
          <div class="skeleton skeleton--text skeleton--w-60"></div>
        </div>
      </div>
      <div class="page">
        <div class="skeleton skeleton--card skeleton--about"></div>
        <div class="sections-grid">
          <div class="skeleton skeleton--card skeleton--collapsible-block"></div>
          <div class="skeleton skeleton--card skeleton--collapsible-block"></div>
          <div class="skeleton skeleton--card skeleton--collapsible-block"></div>
          <div class="skeleton skeleton--card skeleton--collapsible-block"></div>
        </div>
      </div>
    } @else if (entrepreneurship(); as e) {
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
                <a class="hero__dropdown-item" [routerLink]="['/app', 'entrepreneurships', e.entrepreneurshipId, 'edit']" (click)="coverMenuOpen.set(false)">
                  <i class="pi pi-pencil"></i> Editar emprendimiento
                </a>
              </div>
            }
          </div>
        }
        <input #coverInput type="file" accept="image/*" (change)="onCoverSelected($event)" style="display:none" />
        <a class="hero__back" [routerLink]="(isAppContext ? '/app' : '') + '/entrepreneurships'" aria-label="Volver a emprendimientos">
          <i class="pi pi-arrow-left"></i>
          <span>Volver</span>
        </a>
        <div class="hero-overlay">
          <div class="hero-content">
            @if (e.categoryName) {
              <span class="hero-chip" [ngClass]="categoryChipClass(e.categoryName)">{{ e.categoryName }}</span>
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

      <!-- ===== TABS ===== -->
      @if (portalHtml()) {
      <div class="detail-tabs" [style]="{ '--pos': activeTab() === 'portal' ? '100%' : '0%' }">
        <span class="detail-tabs__indicator"></span>
        <button class="detail-tabs__tab" [class.detail-tabs__tab--active]="activeTab() === 'info'" (click)="activeTab.set('info')">
          <i class="pi pi-info-circle"></i> Información
        </button>
        <button class="detail-tabs__tab" [class.detail-tabs__tab--active]="activeTab() === 'portal'" (click)="activeTab.set('portal')">
          <i class="pi pi-globe"></i> Portal
        </button>
      </div>
      }

      @if (activeTab() === 'info') {
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
                  <div class="social-grid">
                    @for (link of socialLinks(); track $index) {
                      <a class="social-card" [href]="link.url" target="_blank" rel="noopener noreferrer" [title]="link.url">
                        <div class="social-card__icon" [style.background]="platformColor(link.socialPlatformName ?? undefined, link.url)">
                          <i [class]="platformIcon(link.socialPlatformName ?? undefined, link.url)"></i>
                        </div>
                        <span class="social-card__name">{{ platformDisplayName(link.socialPlatformName ?? undefined, link.url) }}</span>
                        <span class="social-card__url">{{ link.url }}</span>
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
        @if (galleryLoading() || galleryImages().length > 0) {
          <section class="gallery-section">
            <div class="gallery-section__inner">
              <div class="gallery-section__header">
                <i class="pi pi-images"></i>
                <h2 class="gallery-section__title">Galería</h2>
                @if (galleryLoading()) {
                  <span class="gallery-section__skeleton skeleton skeleton--text skeleton--w-20"></span>
                } @else {
                  <span class="gallery-section__count">{{ galleryImages().length }} fotos</span>
                }
              </div>
              @if (galleryLoading()) {
                <div class="gallery-section__carousel">
                  @for (_ of [1,2,3,4]; track $index) {
                    <div class="gallery-section__skeleton skeleton skeleton--slide"></div>
                  }
                </div>
              } @else {
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
              }
            </div>
          </section>
        }

        <!-- ===== ORGANIZADOR (full-width) ===== -->
        @if (orgName()) {
          <section class="org-section">
            <div class="org-section__inner">
              <div class="org-section__card">
                <div class="org-section__avatar">
                  @if (orgAvatar()) {
                    <img [src]="orgAvatar()" alt="" />
                  } @else {
                    <span class="org-section__initials">{{ orgName()[0] }}</span>
                  }
                </div>
                <div class="org-section__info">
                  <span class="org-section__label">Propietario</span>
                  <strong class="org-section__name">{{ orgName() }}</strong>
                  <div class="org-section__contacts">
                    @if (orgEmail()) {
                      <a class="org-section__contact" [href]="'mailto:' + orgEmail()">
                        <i class="pi pi-envelope"></i>
                        <span>{{ orgEmail() }}</span>
                      </a>
                    }
                    @if (orgPhone()) {
                      <a class="org-section__contact org-section__contact--wa" [href]="whatsappUrl(orgPhone())" target="_blank" rel="noopener">
                        <i class="fab fa-whatsapp"></i>
                        <span>{{ orgPhone() }}</span>
                      </a>
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>
        }
      </div>
      } @else {
        <div class="detail-tabs__panel">
          <app-portal-view [html]="portalHtml()" [title]="portalTitle()" [domain]="portalDomain()" />
        </div>
      }

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
      position: relative;
      width: 100%;
      height: 520px;
      overflow: hidden;
      isolation: isolate;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background: radial-gradient(120% 60% at 50% 0%, rgba(255, 255, 255, 0.16) 0%, transparent 55%);
      mix-blend-mode: overlay;
    }
    .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hero-overlay {
      position: absolute; inset: 0;
      background:
        linear-gradient(to top, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.42) 45%, transparent 80%),
        linear-gradient(to bottom, rgba(2, 6, 23, 0.3) 0%, transparent 32%);
      display: flex; align-items: flex-end; padding: var(--spacing-xxl) var(--spacing-xxl);
    }
    .hero-content { max-width: 1200px; width: 100%; margin: 0 auto; }
    .hero__back {
      position: absolute; top: var(--spacing-md); left: var(--spacing-md); z-index: 10;
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 999px;
      color: #fff; font-size: var(--font-size-sm); font-weight: 600;
      text-decoration: none;
      background: rgba(2, 6, 23, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: background var(--transition-fast), transform var(--transition-fast);
      i { font-size: 13px; }
      &:hover { background: rgba(2, 6, 23, 0.55); transform: translateX(-2px); }
    }
    .hero-chip {
      display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px;
      background: color-mix(in srgb, var(--color-primary) 88%, transparent);
      color: #fff; border-radius: 999px;
      font-size: var(--font-size-xs); font-weight: 700; margin-bottom: var(--spacing-md);
      letter-spacing: 0.3px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      box-shadow: 0 4px 16px rgba(2, 6, 23, 0.25);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      &.chip--blue { background: rgba(59, 130, 246, 0.9); }
      &.chip--indigo { background: rgba(99, 102, 241, 0.9); }
      &.chip--sky { background: rgba(14, 165, 233, 0.9); }
      &.chip--cyan { background: rgba(6, 182, 212, 0.9); }
      &.chip--teal { background: rgba(20, 184, 166, 0.9); }
      &.chip--green { background: rgba(34, 197, 94, 0.9); }
      &.chip--lime { background: rgba(132, 204, 22, 0.9); }
      &.chip--amber { background: rgba(217, 119, 6, 0.9); }
      &.chip--orange { background: rgba(249, 115, 22, 0.9); }
      &.chip--coral { background: rgba(244, 114, 108, 0.9); }
      &.chip--pink { background: rgba(236, 72, 153, 0.9); }
      &.chip--rose { background: rgba(244, 63, 94, 0.9); }
      &.chip--magenta { background: rgba(217, 70, 239, 0.9); }
      &.chip--purple { background: rgba(168, 85, 247, 0.9); }
      &.chip--violet { background: rgba(139, 92, 246, 0.9); }
      &.chip--mandarin { background: rgba(251, 146, 60, 0.9); }
      &.chip--sand { background: rgba(202, 138, 4, 0.9); }
      &.chip--slate { background: rgba(100, 116, 139, 0.9); }
    }
    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 800; color: #fff;
      margin: 0 0 var(--spacing-md); line-height: 1.08; letter-spacing: -0.03em;
      text-shadow: 0 2px 24px rgba(2, 6, 23, 0.35);
    }
    .hero-stats {
      display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);
      & > span {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 16px; border-radius: 999px;
        color: #fff; font-size: var(--font-size-sm); font-weight: 500;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.22);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        i { font-size: 13px; color: #22c55e; }
      }
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

    /* ===== DETAIL TABS ===== */
    .detail-tabs {
      position: relative;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px;
      width: fit-content;
      margin: var(--spacing-lg) auto 0;
      padding: 4px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: 999px;
    }
    .detail-tabs__indicator {
      position: absolute;
      top: 4px;
      bottom: 4px;
      left: 4px;
      width: calc(50% - 4px);
      border-radius: 999px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--color-text-primary) 30%, transparent);
      transform: translateX(var(--pos, 0%));
      transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .detail-tabs__tab {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 18px;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-weight: 600;
      cursor: pointer;
      border-radius: 999px;
      white-space: nowrap;
      transition: color var(--transition-fast);
      i { font-size: 13px; }
      &--active { color: var(--color-primary); }
    }
    .detail-tabs__panel {
      width: 100%;
      padding: var(--spacing-xl) var(--spacing-lg);
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
      transition: box-shadow var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast);
      &:hover {
        box-shadow: 0 16px 44px -14px color-mix(in srgb, var(--color-primary) 38%, transparent);
        border-color: color-mix(in srgb, var(--color-primary) 32%, var(--color-border));
        transform: translateY(-2px);
      }
    }
    .card--about {
      padding-left: calc(var(--spacing-xl) + 56px);
      position: relative;
      overflow: hidden;
    }
    .card--about .card__accent {
      position: absolute; top: 0; left: 0;
      width: 4px; height: 100%;
      background: linear-gradient(180deg, var(--color-primary), var(--color-accent));
      border-radius: 0 4px 4px 0;
    }
    .card__header {
      display: flex; align-items: center; gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      i {
        font-size: 17px; color: var(--color-primary);
        width: 38px; height: 38px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: var(--color-primary-light);
        border-radius: var(--radius-md);
      }
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
    .card--collapsible {
      padding: 0;
      position: relative;
      overflow: hidden;
      &::after {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        opacity: 0;
        transition: opacity var(--transition-fast);
      }
      &.card--open::after { opacity: 1; }
    }
    .card__trigger {
      display: flex; align-items: center; gap: var(--spacing-sm);
      width: 100%; padding: var(--spacing-md) var(--spacing-lg);
      border: none; background: none; cursor: pointer;
      color: var(--color-text-primary); font-size: var(--font-size-sm); font-weight: 600;
      text-align: left; transition: background var(--transition-fast);
      &:hover { background: var(--color-surface-alt); }
      i:first-child {
        font-size: 15px; color: var(--color-primary);
        width: 34px; height: 34px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: var(--color-primary-light);
        border-radius: var(--radius-md);
      }
      .card--open & i:first-child { background: var(--color-primary); color: var(--color-white); }
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
      font-size: var(--font-size-xs); color: var(--color-text-muted);
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; flex-shrink: 0;
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

    /* ===== SOCIAL GRID ===== */
    .social-grid {
      display: flex; flex-wrap: wrap; gap: var(--spacing-md);
    }
    .social-card {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      text-decoration: none;
      min-width: 120px;
      transition: all var(--transition-fast);
      position: relative;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        border-color: transparent;
      }
    }
    .social-card__icon {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #fff;
      transition: transform var(--transition-fast);
      .social-card:hover & { transform: scale(1.1); }
    }
    .social-card__name {
      font-size: var(--font-size-xs); font-weight: 600;
      color: var(--color-text-primary); text-align: center;
    }
    .social-card__url {
      font-size: 10px; color: var(--color-text-muted);
      max-width: 140px; overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap; text-align: center;
    }

    /* ===== SKELETON ===== */
    .skeleton {
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }
    .skeleton--text { height: 14px; }
    .skeleton--chip { width: 100px; height: 28px; border-radius: 999px; }
    .skeleton--title { height: 32px; }
    .skeleton--w-20 { width: 80px; }
    .skeleton--w-40 { width: 40%; }
    .skeleton--w-60 { width: 60%; }
    .skeleton--w-80 { width: 80%; }
    .skeleton--slide {
      flex: 0 0 320px;
      aspect-ratio: 16 / 10;
      border-radius: var(--radius-xl);
    }
    .skeleton--card {
      height: 200px;
      border-radius: var(--radius-xl);
    }
    .skeleton--about { height: 180px; }
    .skeleton--collapsible-block { height: 56px; }

    .hero-skeleton {
      width: 100%;
      height: 520px;
      background: var(--color-surface-alt);
      display: flex; align-items: flex-end;
      padding: var(--spacing-xxl);
    }
    .hero-skeleton__content {
      max-width: 1200px; width: 100%; margin: 0 auto;
      display: flex; flex-direction: column;
      gap: var(--spacing-md);
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ===== GALLERY SECTION ===== */
    .gallery-section {
      width: 100%;
      background: color-mix(in srgb, var(--color-surface-alt) 65%, var(--color-surface));
      border: 1px solid var(--color-border);
      border-radius: 28px;
      padding: var(--spacing-xl) var(--spacing-lg);
      margin: var(--spacing-sm) 0;
    }
    .gallery-section__inner {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 0;
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

    /* ===== ORGANIZADOR SECTION (full-width, elegant) ===== */
    .org-section {
      margin-top: var(--spacing-xxl); padding: 0 var(--spacing-xxl);
    }
    .org-section__inner {
      max-width: 1200px; margin: 0 auto; width: 100%;
    }
    .org-section__card {
      display: flex; align-items: center; gap: var(--spacing-xl);
      background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%);
      border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      padding: var(--spacing-xl) var(--spacing-xxl);
      box-shadow: 0 4px 24px rgba(0,0,0,0.04); transition: box-shadow var(--transition-normal);
      &:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
    }
    .org-section__avatar {
      width: 88px; height: 88px; border-radius: 50%;
      flex-shrink: 0; padding: 3px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      box-shadow: 0 10px 26px -8px color-mix(in srgb, var(--color-primary) 50%, transparent);
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
    }
    .org-section__initials {
      width: 100%; height: 100%; display: flex; align-items: center;
      justify-content: center; background: var(--color-surface);
      border-radius: 50%; color: var(--color-primary);
      font-size: 30px; font-weight: 800;
    }
    .org-section__info {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; gap: 4px;
    }
    .org-section__label {
      font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase;
      letter-spacing: 1px; color: var(--color-text-tertiary);
    }
    .org-section__name {
      font-size: var(--font-size-lg); font-weight: 700;
      color: var(--color-text-primary); line-height: 1.3;
    }
    .org-section__contacts {
      display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-sm);
    }
    .org-section__contact {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: var(--font-size-sm); color: var(--color-text-secondary); text-decoration: none;
      padding: 8px 16px; border-radius: var(--radius-md);
      background: var(--color-surface); border: 1px solid var(--color-border);
      transition: all var(--transition-fast);
      i { font-size: 16px; color: var(--color-primary); }
      &:hover { border-color: var(--color-primary); color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 4%, transparent); }
    }
    .org-section__contact--wa i { color: #25D366; }
    .org-section__contact--wa:hover { border-color: #25D366; color: #25D366; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .sections-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero { height: auto; min-height: 460px; }
      .hero-skeleton { height: 460px; }
      .hero__back { padding: 7px 12px; font-size: var(--font-size-xs); }
      .hero-content { padding-top: 96px; }
      .hero-overlay { padding: var(--spacing-lg); }
      .hero-stats { flex-direction: column; align-items: flex-start; gap: var(--spacing-xs); }
      .page { padding: var(--spacing-lg); gap: var(--spacing-lg); }
      .card--about { padding-left: var(--spacing-xl); }
      .card--about .card__accent { display: none; }
      .info-row { flex-direction: column; align-items: flex-start; gap: 2px; }
      .info-row__value { text-align: left; max-width: 100%; }
      .social-card { min-width: 90px; padding: var(--spacing-sm) var(--spacing-md); }
      .social-card__icon { width: 40px; height: 40px; font-size: 18px; border-radius: 12px; }
      .gallery-section__slide { flex: 0 0 260px; }
      .gallery-section { padding: var(--spacing-lg); border-radius: 20px; }
      .org-section { padding: 0 var(--spacing-md); }
      .org-section__card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-lg);
      }
      .org-section__info { align-items: center; }
      .org-section__contacts { justify-content: center; }
      .lightbox__nav { width: 40px; height: 40px; font-size: 18px; }
      .lightbox__nav--prev { left: 10px; } .lightbox__nav--next { right: 10px; }
      .lightbox__img { max-width: 95vw; }
    }
  `],
})
export class PublicDetailComponent implements OnInit {
  readonly categoryChipClass = categoryChipClass;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);
  private readonly authService = inject(AuthenticationService);
  private readonly toastService = inject(ToastService);

  get isAppContext(): boolean {
    return this.router.url.startsWith('/app');
  }

  readonly loading = signal(true);
  readonly entrepreneurship = signal<Entrepreneurship | null>(null);
  readonly locations = signal<EntrepreneurshipLocation[]>([]);
  readonly socialLinks = signal<EntitySocialLink[]>([]);
  readonly portal = signal<EntityPortal | null>(null);
  readonly galleryImages = signal<ImageGallery[]>([]);
  readonly galleryLoading = signal(false);

  readonly coverMenuOpen = signal(false);
  readonly coverUrl = signal<string | null>(null);
  readonly coverUploading = signal(false);

  readonly selectedImage = signal<ImageGallery | null>(null);
  readonly galleryIdx = signal(-1);

  readonly orgName = signal('');
  readonly orgAvatar = signal('');
  readonly orgEmail = signal('');
  readonly orgPhone = signal('');

  readonly expandedSections = signal<Set<string>>(new Set(['info', 'ubicaciones', 'sociales', 'portal', 'org']));

  readonly activeTab = signal<'info' | 'portal'>('info');
  readonly portalHtml = computed(() => this.portal()?.htmlContent?.trim() || '');
  readonly portalTitle = computed(() => this.entrepreneurship()?.name || 'Portal');
  readonly portalDomain = computed(() => {
    const s = this.portal()?.subdomain;
    return s ? `${s}.emprendia.com` : '';
  });

  readonly typeDisplay = computed(() => {
    const e = this.entrepreneurship();
    if (!e) return '';
    return e.isPhysical && e.isDigital ? 'Físico y Digital'
         : e.isPhysical ? 'Físico'
         : 'Digital';
  });

  platformDisplayName(name: string | undefined, url: string): string {
    if (name) return name;
    const u = url.toLowerCase();
    if (u.includes('facebook')) return 'Facebook';
    if (u.includes('instagram')) return 'Instagram';
    if (u.includes('twitter') || u.includes('x.com')) return 'X';
    if (u.includes('linkedin')) return 'LinkedIn';
    if (u.includes('youtube')) return 'YouTube';
    if (u.includes('whatsapp')) return 'WhatsApp';
    if (u.includes('tiktok')) return 'TikTok';
    if (u.includes('telegram')) return 'Telegram';
    if (u.includes('github')) return 'GitHub';
    if (u.includes('pinterest')) return 'Pinterest';
    if (u.includes('twitch')) return 'Twitch';
    if (u.includes('discord')) return 'Discord';
    if (u.includes('medium')) return 'Medium';
    if (u.includes('slack')) return 'Slack';
    if (u.includes('snapchat')) return 'Snapchat';
    if (u.includes('reddit')) return 'Reddit';
    if (u.includes('tumblr')) return 'Tumblr';
    if (u.includes('vimeo')) return 'Vimeo';
    if (u.includes('dribbble')) return 'Dribbble';
    if (u.includes('behance')) return 'Behance';
    if (u.includes('spotify')) return 'Spotify';
    return 'Red social';
  }

  private resolvePlatformName(name: string | undefined, url: string): string {
    if (name) return name;
    const u = url.toLowerCase();
    if (u.includes('facebook')) return 'facebook';
    if (u.includes('instagram')) return 'instagram';
    if (u.includes('twitter') || u.includes('x.com')) return 'x';
    if (u.includes('linkedin')) return 'linkedin';
    if (u.includes('youtube')) return 'youtube';
    if (u.includes('whatsapp')) return 'whatsapp';
    if (u.includes('tiktok')) return 'tiktok';
    if (u.includes('telegram')) return 'telegram';
    if (u.includes('github')) return 'github';
    if (u.includes('pinterest')) return 'pinterest';
    if (u.includes('twitch')) return 'twitch';
    if (u.includes('discord')) return 'discord';
    if (u.includes('medium')) return 'medium';
    if (u.includes('slack')) return 'slack';
    if (u.includes('snapchat')) return 'snapchat';
    if (u.includes('reddit')) return 'reddit';
    if (u.includes('tumblr')) return 'tumblr';
    if (u.includes('vimeo')) return 'vimeo';
    if (u.includes('dribbble')) return 'dribbble';
    if (u.includes('behance')) return 'behance';
    if (u.includes('spotify')) return 'spotify';
    return '';
  }

  platformIcon(name: string | undefined, url?: string): string {
    const n = name || (url ? this.resolvePlatformName(undefined, url) : '') || '';
    const lower = n.toLowerCase();
    if (lower.includes('facebook')) return 'fab fa-facebook';
    if (lower.includes('instagram')) return 'fab fa-instagram';
    if (lower.includes('twitter') || lower.includes('x')) return 'fab fa-x-twitter';
    if (lower.includes('linkedin')) return 'fab fa-linkedin-in';
    if (lower.includes('youtube')) return 'fab fa-youtube';
    if (lower.includes('whatsapp')) return 'fab fa-whatsapp';
    if (lower.includes('tiktok')) return 'fab fa-tiktok';
    if (lower.includes('telegram')) return 'fab fa-telegram';
    if (lower.includes('github')) return 'fab fa-github';
    if (lower.includes('pinterest')) return 'fab fa-pinterest';
    if (lower.includes('twitch')) return 'fab fa-twitch';
    if (lower.includes('discord')) return 'fab fa-discord';
    if (lower.includes('medium')) return 'fab fa-medium';
    if (lower.includes('slack')) return 'fab fa-slack';
    if (lower.includes('snapchat')) return 'fab fa-snapchat';
    if (lower.includes('reddit')) return 'fab fa-reddit';
    if (lower.includes('tumblr')) return 'fab fa-tumblr';
    if (lower.includes('vimeo')) return 'fab fa-vimeo';
    if (lower.includes('dribbble')) return 'fab fa-dribbble';
    if (lower.includes('behance')) return 'fab fa-behance';
    if (lower.includes('spotify')) return 'fab fa-spotify';
    return 'fas fa-globe';
  }

  platformColor(name: string | undefined, url?: string): string {
    const n = name || (url ? this.resolvePlatformName(undefined, url) : '') || '';
    const lower = n.toLowerCase();
    if (lower.includes('facebook')) return '#1877F2';
    if (lower.includes('instagram')) return '#E4405F';
    if (lower.includes('twitter') || lower.includes('x')) return '#1DA1F2';
    if (lower.includes('linkedin')) return '#0A66C2';
    if (lower.includes('youtube')) return '#FF0000';
    if (lower.includes('whatsapp')) return '#25D366';
    if (lower.includes('tiktok')) return '#000000';
    if (lower.includes('telegram')) return '#26A5E4';
    if (lower.includes('github')) return '#333333';
    if (lower.includes('pinterest')) return '#E60023';
    return '#6366F1';
  }

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
    this.loading.set(true);
    try {
      const result = await lastValueFrom(this.entrepreneurshipService.getById(id));
      this.entrepreneurship.set(result);
      const user = (result as any).createdByUser;
      if (user) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '';
        this.orgName.set(fullName);
        this.orgAvatar.set(user.profilePictureUrl || '');
        if (user.contacts?.length) {
          const emailContact = user.contacts.find((c: any) => c.contactTypeId === 75);
          const phoneContact = user.contacts.find((c: any) => c.contactTypeId === 74);
          this.orgEmail.set(emailContact?.contactValue || '');
          this.orgPhone.set(phoneContact?.contactValue || '');
        }
      }
    } catch {
      // fallback
    } finally {
      this.loading.set(false);
    }
  }

  whatsappUrl(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleaned}`;
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
    this.galleryLoading.set(true);
    try {
      const images = await lastValueFrom(this.imageService.list('ENTREPRENEURSHIP', id));
      this.galleryImages.set(images.filter(img => img.displayOrder !== 0));
    } catch {
      // fallback
    }
    finally { this.galleryLoading.set(false); }
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
      this.toastService.success('Portada del emprendimiento actualizada.');
    } catch {
      this.toastService.error('No se pudo actualizar la portada del emprendimiento.');
    } finally {
      this.coverUploading.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }
}
