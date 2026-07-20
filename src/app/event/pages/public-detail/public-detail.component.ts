import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventService } from '../../services/event.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { CATALOGUE_CODES, PARTICIPATION_STATUS } from '../../../core/constants/app.constants';
import type { Event } from '../../models/event';
import type { EventParticipant } from '../../models/event-invitation';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';

const TYPE_MAP: Record<string, string> = { PHYSICAL: 'Presencial', VIRTUAL: 'Virtual', HYBRID: 'Híbrido' };
const VISIBILITY_MAP: Record<string, string> = { PUBLIC: 'Público', PRIVATE: 'Privado' };
const TYPE_CLASS: Record<string, string> = { PHYSICAL: 'chip--blue', VIRTUAL: 'chip--purple', HYBRID: 'chip--amber' };

function fmt(d: string | Date, pattern = "d 'de' MMMM 'de' yyyy"): string {
  return format(typeof d === 'string' ? parseISO(d) : d, pattern, { locale: es });
}
function fmtTime(d: string | Date): string {
  return format(typeof d === 'string' ? parseISO(d) : d, 'HH:mm', { locale: es });
}

@Component({
  selector: 'app-event-public-detail',
  standalone: true,
  imports: [RouterLink, NgClass, ClickOutsideDirective],
  template: `
    @if (event(); as e) {
      <!-- ===== HERO ===== -->
      <div class="hero animate__animated animate__fadeIn">
        <img [src]="imageService.getEntityImageUrl(e, 'EVENT', e.eventId)" alt="{{ e.name }}" class="hero-img" />
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
            <span class="hero-chip animate__animated animate__fadeInDown" [ngClass]="typeCssClass()">{{ eventTypeName() }}</span>
            <h1 class="hero-title animate__animated animate__fadeInUp">{{ e.name }}</h1>
            <div class="hero-stats animate__animated animate__fadeInUp">
              <span><i class="pi pi-calendar"></i> {{ startDateDisplay() }}</span>
              <span><i class="pi pi-map-marker"></i> {{ locationDisplay() }}</span>
              <span>
                @if (e.isPaid && e.price) {
                  <i class="pi pi-dollar price-icon price-icon--paid"></i> \${{ e.price.toFixed(2) }}
                } @else {
                  <i class="pi pi-check-circle price-icon price-icon--free"></i> Gratuito
                }
              </span>
            </div>
            @if (orgName(); as name) {
              <div class="hero__organizer animate__animated animate__fadeInUp">
                @if (orgAvatar()) {
                  <img [src]="orgAvatar()" alt="" class="hero__org-avatar" />
                } @else {
                  <div class="hero__org-avatar hero__org-avatar--fallback">{{ name[0] }}</div>
                }
                <span>Organizado por <strong>{{ name }}</strong></span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ===== CONTENT ===== -->
      <div class="page">

        <!-- ===== ABOUT ===== -->
        @if (e.description) {
          <section class="card card--about animate__animated animate__fadeInUp">
            <div class="card__accent"></div>
            <div class="card__header">
              <i class="pi pi-info-circle"></i>
              <h2 class="card__title">Acerca del evento</h2>
            </div>
            <p class="card__text">{{ e.description }}</p>
          </section>
        }

        <!-- ===== PARTICIPANTS ===== -->
        @if (participants().length > 0) {
          <section class="card animate__animated animate__fadeInUp">
            <div class="card__header">
              <i class="pi pi-users"></i>
              <h2 class="card__title">Emprendimientos participantes</h2>
              <span class="card__badge">{{ participants().length }}</span>
            </div>
            <div class="entrepreneur-list">
              @for (p of participants(); track p.eventParticipantId) {
                <a class="entrepreneur-card animate__animated animate__fadeInRight"
                   [style.animation-delay]="0.05 * $index + 's'"
                   [routerLink]="(isAppContext ? '/app' : '') + '/entrepreneurships/' + p.entrepreneurshipId">
                  <div class="entrepreneur-card__avatar">
                    <img [src]="imageService.getEntityImageUrl(
                      { imageUrl: p.entrepreneurship?.imageUrl, imageId: p.entrepreneurship?.imageId },
                      'ENTREPRENEURSHIP', p.entrepreneurshipId)" alt="" />
                  </div>
                  <div class="entrepreneur-card__body">
                    <strong class="entrepreneur-card__name">{{ p.entrepreneurship?.name }}</strong>
                    @if (p.entrepreneurship?.categoryName) {
                      <span class="entrepreneur-card__category">{{ p.entrepreneurship?.categoryName }}</span>
                    }
                    @if (p.entrepreneurship?.description) {
                      <p class="entrepreneur-card__desc">{{ p.entrepreneurship?.description }}</p>
                    }
                    @if (p.spaceCode) {
                      <span class="entrepreneur-card__space"><i class="pi pi-qrcode"></i> Espacio {{ p.spaceCode }}</span>
                    }
                  </div>
                  <span class="entrepreneur-card__arrow"><i class="pi pi-chevron-right"></i></span>
                </a>
              }
            </div>
          </section>
        }

        <!-- ===== 2-COLUMN COLLAPSIBLE ===== -->
        <div class="sections-grid">
          <section class="card card--collapsible animate__animated animate__fadeInUp"
                   [class.card--open]="expandedSections().has('fecha')">
            <button class="card__trigger" (click)="toggleSection('fecha')">
              <i class="pi pi-calendar"></i>
              <span class="card__trigger-title">Fecha y ubicación</span>
              <i class="pi pi-chevron-down card__chevron"></i>
            </button>
            @if (expandedSections().has('fecha')) {
              <div class="card__body">
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-row__label">Inicio</span>
                    <span class="info-row__value">{{ startDateDisplay() }} · {{ startTimeDisplay() }}</span>
                  </div>
                  <div class="info-row__divider"></div>
                  <div class="info-row">
                    <span class="info-row__label">Fin</span>
                    <span class="info-row__value">{{ endDateDisplay() }} · {{ endTimeDisplay() }}</span>
                  </div>
                  <div class="info-row__divider"></div>
                  <div class="info-row">
                    <span class="info-row__label">Ubicación</span>
                    <span class="info-row__value">{{ locationDisplay() }}</span>
                  </div>
                  @if (e.addressLine) {
                    <div class="info-row__divider"></div>
                    <div class="info-row">
                      <span class="info-row__label">Dirección</span>
                      <span class="info-row__value">{{ e.addressLine }}</span>
                    </div>
                  }
                  @if (e.virtualLink) {
                    <div class="info-row__divider"></div>
                    <div class="info-row">
                      <span class="info-row__label">Enlace virtual</span>
                      <a class="info-row__value info-row__value--link" [href]="e.virtualLink" target="_blank" rel="noopener">{{ e.virtualLink }}</a>
                    </div>
                  }
                </div>
              </div>
            }
          </section>

          <section class="card card--collapsible animate__animated animate__fadeInUp"
                   [class.card--open]="expandedSections().has('org')">
            <button class="card__trigger" (click)="toggleSection('org')">
              <i class="pi pi-user"></i>
              <span class="card__trigger-title">Organizador</span>
              <i class="pi pi-chevron-down card__chevron"></i>
            </button>
            @if (expandedSections().has('org')) {
              <div class="card__body">
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-row__label">Nombre</span>
                    <span class="info-row__value">{{ orgName() }}</span>
                  </div>
                  @if (orgEmail()) {
                    <div class="info-row__divider"></div>
                    <div class="info-row">
                      <span class="info-row__label">Correo</span>
                      <a class="info-row__value info-row__value--link" [href]="'mailto:' + orgEmail()">{{ orgEmail() }}</a>
                    </div>
                  }
                  @if (orgPhone()) {
                    <div class="info-row__divider"></div>
                    <div class="info-row">
                      <span class="info-row__label">Teléfono</span>
                      <a class="info-row__value info-row__value--link" [href]="'tel:' + orgPhone()">{{ orgPhone() }}</a>
                    </div>
                  }
                  <div class="info-row__divider"></div>
                  <div class="info-row">
                    <span class="info-row__label">Publicado</span>
                    <span class="info-row__value">{{ createdAtDisplay() }}</span>
                  </div>
                </div>
              </div>
            }
          </section>

          <section class="card card--collapsible animate__animated animate__fadeInUp"
                   [class.card--open]="expandedSections().has('tipo')">
            <button class="card__trigger" (click)="toggleSection('tipo')">
              <i class="pi pi-ticket"></i>
              <span class="card__trigger-title">Tipo y acceso</span>
              <i class="pi pi-chevron-down card__chevron"></i>
            </button>
            @if (expandedSections().has('tipo')) {
              <div class="card__body">
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-row__label">Tipo de evento</span>
                    <span class="info-row__value">{{ eventTypeName() }}</span>
                  </div>
                  <div class="info-row__divider"></div>
                  <div class="info-row">
                    <span class="info-row__label">Visibilidad</span>
                    <span class="info-row__value">{{ eventVisibilityName() }}</span>
                  </div>
                  <div class="info-row__divider"></div>
                  <div class="info-row">
                    <span class="info-row__label">Entrada</span>
                    @if (e.isPaid && e.price) {
                      <span class="info-row__value info-row__value--paid">\${{ e.price.toFixed(2) }}</span>
                    } @else {
                      <span class="info-row__value info-row__value--free">Gratuito</span>
                    }
                  </div>
                  @if (e.maxAttendees) {
                    <div class="info-row__divider"></div>
                    <div class="info-row">
                      <span class="info-row__label">Capacidad</span>
                      <span class="info-row__value">{{ e.maxAttendees }} asistentes</span>
                    </div>
                  }
                  @if (e.maxEntrepreneurships) {
                    <div class="info-row__divider"></div>
                    <div class="info-row">
                      <span class="info-row__label">Cupos emprendedores</span>
                      <span class="info-row__value">{{ e.maxEntrepreneurships }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </section>

        </div>

        <!-- ===== GALLERY (full-width) ===== -->
        @if (galleryImages().length > 0) {
          <section class="gallery-section animate__animated animate__fadeInUp">
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
                <button class="gallery-section__arrow gallery-section__arrow--left" (click)="scrollGallery(-1)"><i class="pi pi-chevron-left"></i></button>
                <button class="gallery-section__arrow gallery-section__arrow--right" (click)="scrollGallery(1)"><i class="pi pi-chevron-right"></i></button>
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
            <button class="lightbox__nav lightbox__nav--prev" (click)="prevImage(); $event.stopPropagation()"><i class="pi pi-chevron-left"></i></button>
          }
          <img [src]="img.imageUrl" [alt]="img.altText || ''" class="lightbox__img" (click)="$event.stopPropagation()" />
          @if (galleryIdx() < galleryImages().length - 1) {
            <button class="lightbox__nav lightbox__nav--next" (click)="nextImage(); $event.stopPropagation()"><i class="pi pi-chevron-right"></i></button>
          }
          <div class="lightbox__counter">{{ galleryIdx() + 1 }} / {{ galleryImages().length }}</div>
        </div>
      }
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
      color: #fff; border-radius: 999px; font-size: var(--font-size-xs);
      font-weight: 600; margin-bottom: var(--spacing-md); letter-spacing: 0.3px;
      &.chip--blue { background: #3b82f6; }
      &.chip--purple { background: #8b5cf6; }
      &.chip--amber { background: #d97706; }
      &:not(.chip--blue):not(.chip--purple):not(.chip--amber) { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); }
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
    .price-icon--free, .price-icon--paid { color: #22c55e; }
    .hero__organizer {
      display: flex; align-items: center; gap: 10px;
      color: rgba(255,255,255,0.75); font-size: var(--font-size-sm);
      strong { color: #fff; }
    }
    .hero__org-avatar {
      width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
      border: 2px solid rgba(255,255,255,0.4); flex-shrink: 0;
    }
    .hero__org-avatar--fallback {
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.2); color: #fff; font-size: 14px; font-weight: 700;
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

    /* ===== CARD (unified style) ===== */
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
    .card__badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 28px; height: 28px; padding: 0 10px; border-radius: 999px;
      background: var(--color-primary-light); color: var(--color-primary);
      font-size: var(--font-size-xs); font-weight: 700;
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
    /* ===== ENTREPRENEUR LIST ===== */
    .entrepreneur-list {
      display: flex; flex-direction: column; gap: var(--spacing-sm);
    }
    .entrepreneur-card {
      display: flex; align-items: center; gap: var(--spacing-md);
      padding: var(--spacing-md); border-radius: var(--radius-lg);
      text-decoration: none; background: var(--color-surface);
      border: 1px solid var(--color-border);
      transition: all var(--transition-fast);
      &:hover { border-color: var(--color-primary); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateX(4px); }
    }
    .entrepreneur-card__avatar {
      width: 56px; height: 56px; border-radius: 50%; overflow: hidden;
      flex-shrink: 0; border: 2px solid var(--color-border);
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .entrepreneur-card:hover & { border-color: var(--color-primary); }
    }
    .entrepreneur-card__body {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; gap: 2px;
    }
    .entrepreneur-card__name {
      font-size: var(--font-size-sm); font-weight: 700;
      color: var(--color-text-primary); display: block;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .entrepreneur-card__category {
      font-size: var(--font-size-xs); color: var(--color-primary); font-weight: 600;
    }
    .entrepreneur-card__desc {
      font-size: var(--font-size-xs); color: var(--color-text-muted);
      margin: 0; display: -webkit-box; -webkit-line-clamp: 1;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .entrepreneur-card__arrow {
      color: var(--color-text-muted); font-size: 14px; flex-shrink: 0;
      .entrepreneur-card:hover & { color: var(--color-primary); }
    }
    .entrepreneur-card__space {
      font-size: 10px; color: var(--color-accent); font-weight: 600;
      display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;
      i { font-size: 11px; }
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

    /* ===== GALLERY SECTION (full-width) ===== */
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
  private readonly eventService = inject(EventService);
  private readonly authService = inject(AuthenticationService);
  private readonly catalogueService = inject(CatalogueService);
  readonly imageService = inject(ImageService);

  get isAppContext(): boolean {
    return this.router.url.startsWith('/app');
  }

  readonly event = signal<Event | null>(null);
  readonly participants = signal<EventParticipant[]>([]);
  readonly coverMenuOpen = signal(false);
  readonly uploadingCover = signal(false);

  readonly acceptedStatusId = signal<number | null>(null);
  readonly galleryImages = signal<ImageGallery[]>([]);
  readonly selectedImage = signal<ImageGallery | null>(null);
  readonly galleryIdx = signal(-1);

  readonly expandedSections = signal<Set<string>>(new Set(['fecha', 'org', 'tipo']));

  readonly orgName = signal('');
  readonly orgAvatar = signal('');
  readonly orgEmail = signal('');
  readonly orgPhone = signal('');

  readonly locationDisplay = computed(() => {
    const e = this.event();
    if (!e) return '';
    const city = e.city?.name || e.cityName || '';
    const province = e.province?.name || e.provinceName || '';
    const country = e.country?.name || e.countryName || '';
    return [city, province, country].filter(Boolean).join(', ');
  });
  readonly startDateDisplay = computed(() => this.event() ? fmt(this.event()!.startDatetime) : '');
  readonly startTimeDisplay = computed(() => this.event() ? fmtTime(this.event()!.startDatetime) : '');
  readonly endDateDisplay = computed(() => this.event() ? fmt(this.event()!.endDatetime) : '');
  readonly endTimeDisplay = computed(() => this.event() ? fmtTime(this.event()!.endDatetime) : '');
  readonly createdAtDisplay = computed(() => this.event() ? fmt(this.event()!.createdAt, "d 'de' MMMM 'de' yyyy") : '');
  readonly eventTypeName = computed(() => {
    const e = this.event();
    if (e?.eventType?.code) return TYPE_MAP[e.eventType.code] || e.eventType.name || 'Evento';
    return e?.eventTypeName || 'Evento';
  });
  readonly typeCssClass = computed(() => {
    const e = this.event();
    return e?.eventType?.code ? (TYPE_CLASS[e.eventType.code] || '') : '';
  });
  readonly eventVisibilityName = computed(() => {
    const e = this.event();
    if (e?.eventVisibility?.code) return VISIBILITY_MAP[e.eventVisibility.code] || e.eventVisibility.name || '—';
    return e?.eventVisibilityName || '—';
  });

  @ViewChild('coverInput') coverInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('carousel') carouselRef!: ElementRef<HTMLElement>;

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    await Promise.all([
      this.loadEvent(id),
      this.loadParticipationStatuses(id),
      this.loadGallery(id),
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

  private async loadEvent(id: number): Promise<void> {
    try {
      const result = await lastValueFrom(this.eventService.getById(id));
      this.event.set(result);
      this.buildComputedFields(result);
    } catch { /* fallback */ }
  }

  private buildComputedFields(e: Event): void {
    const user = e.createdByUser;
    if (user) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Organizador';
      this.orgName.set(fullName);
      this.orgAvatar.set(user.profilePictureUrl || '');
      if (user.contacts?.length) {
        const primary = user.contacts.find(c => c.isPrimary);
        const emailContact = user.contacts.find(c => c.contactTypeId === 75);
        const phoneContact = user.contacts.find(c => c.contactTypeId === 74);
        this.orgEmail.set((primary?.contactValue.includes('@') ? primary.contactValue : emailContact?.contactValue) || '');
        this.orgPhone.set((primary && !primary.contactValue.includes('@') ? primary.contactValue : phoneContact?.contactValue) || '');
      }
    } else if (e.organizerName) { this.orgName.set(e.organizerName); }
  }

  private async loadParticipationStatuses(eventId: number): Promise<void> {
    try {
      const statuses = await lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_PARTICIPATION_STATUS));
      const accepted = statuses.find((s: CatalogueValue) => s.code === PARTICIPATION_STATUS.ACCEPTED);
      this.acceptedStatusId.set(accepted?.catalogueValueId ?? null);
      await this.loadParticipants(eventId, this.acceptedStatusId() ?? undefined);
    } catch { await this.loadParticipants(eventId); }
  }

  private async loadParticipants(id: number, statusId?: number): Promise<void> {
    try { this.participants.set(await lastValueFrom(this.eventService.getParticipants(id, statusId))); }
    catch { /* fallback */ }
  }

  private async loadGallery(eventId: number): Promise<void> {
    try {
      const images = await lastValueFrom(this.imageService.list('EVENT', eventId));
      this.galleryImages.set(images.filter(img => img.displayOrder !== 0));
    } catch { /* fallback */ }
  }

  openGallery(img: ImageGallery): void {
    const idx = this.galleryImages().findIndex(i => i.imageId === img.imageId);
    this.galleryIdx.set(idx); this.selectedImage.set(img);
  }
  closeGallery(): void { this.galleryIdx.set(-1); this.selectedImage.set(null); }
  nextImage(): void {
    const imgs = this.galleryImages(); const idx = this.galleryIdx();
    if (idx < imgs.length - 1) { this.galleryIdx.set(idx + 1); this.selectedImage.set(imgs[idx + 1]); }
  }
  prevImage(): void {
    const imgs = this.galleryImages(); const idx = this.galleryIdx();
    if (idx > 0) { this.galleryIdx.set(idx - 1); this.selectedImage.set(imgs[idx - 1]); }
  }
  toggleCoverMenu(): void { this.coverMenuOpen.update(v => !v); }
  openCoverPicker(): void { this.coverMenuOpen.set(false); this.coverInputRef.nativeElement.click(); }

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
      await lastValueFrom(this.imageService.upload(file, 'EVENT', ev.eventId, 0, 'Portada de ' + ev.name, this.authService.backendUserId() ?? undefined));
      for (const old of oldCovers) { try { await lastValueFrom(this.imageService.delete(old.imageId, 'EVENT', ev.eventId)); } catch { /* ignore */ } }
      this.imageService.invalidateCache('EVENT', ev.eventId);
      await this.loadEvent(ev.eventId);
      await this.loadGallery(ev.eventId);
    } catch (err) { console.error('Error updating cover:', err); }
    finally { this.uploadingCover.set(false); }
  }
}
