import {
  Component,
  Input,
  TemplateRef,
  signal,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="hero-carousel"
         (mouseenter)="onMouseEnter()"
         (mouseleave)="onMouseLeave()"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd()">

      <div class="hero-carousel__viewport" #viewport>
        @for (item of items; track trackByFn($index, item); let i = $index) {
          <div class="hero-carousel__slide"
               [class.hero-carousel__slide--active]="getPosition(i) === 'active'"
               [class.hero-carousel__slide--next]="getPosition(i) === 'next'"
               [class.hero-carousel__slide--prev]="getPosition(i) === 'prev'"
               [class.hero-carousel__slide--hidden]="getPosition(i) === 'hidden'">
            <ng-container *ngTemplateOutlet="template; context: { $implicit: item, index: i }" />
          </div>
        }
      </div>

      @if (items.length > 1) {
        <button class="hero-carousel__arrow hero-carousel__arrow--left"
                (click)="prev()" aria-label="Anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button class="hero-carousel__arrow hero-carousel__arrow--right"
                (click)="next()" aria-label="Siguiente">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      }

      @if (items.length > 1) {
        <div class="hero-carousel__nav">
          <div class="hero-carousel__dots">
            @for (item of items; track trackByFn($index, item); let i = $index) {
              <button class="hero-carousel__dot"
                      [class.hero-carousel__dot--active]="i === activeIndex()"
                      (click)="goTo(i)"
                      [attr.aria-label]="'Ir al elemento ' + (i + 1)"></button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .hero-carousel {
      position: relative;
      width: 100%;
      min-height: 520px;
      user-select: none;
      isolation: isolate;
    }

    .hero-carousel__viewport {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: inherit;
      overflow: hidden;
    }

    /* ===== BASE SLIDE ===== */
    .hero-carousel__slide {
      position: absolute;
      top: 0;
      left: 50%;
      width: calc(100% - 200px);
      height: 100%;
      min-height: inherit;
      border-radius: var(--radius-xl);
      overflow: hidden;
      will-change: transform, opacity;
      transition:
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      backface-visibility: hidden;
    }

    /* ===== ACTIVE ===== */
    .hero-carousel__slide--active {
      transform: translateX(-50%) scale(1);
      opacity: 1;
      z-index: 3;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
    }

    /* ===== NEXT ===== */
    .hero-carousel__slide--next {
      left: 100%;
      transform: translateX(calc(-100% - 8vw)) scale(0.92);
      opacity: 0.35;
      z-index: 2;
    }

    /* ===== PREV ===== */
    .hero-carousel__slide--prev {
      left: 0%;
      transform: translateX(calc(0% - 5vw)) scale(0.84);
      opacity: 0.1;
      z-index: 1;
    }

    /* ===== HIDDEN ===== */
    .hero-carousel__slide--hidden {
      opacity: 0;
      pointer-events: none;
      z-index: 0;
    }

    /* ===== ARROWS ===== */
    .hero-carousel__arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition:
        opacity 0.3s ease,
        transform 0.3s ease,
        box-shadow 0.3s ease;
      opacity: 0;
    }
    .hero-carousel:hover .hero-carousel__arrow {
      opacity: 1;
    }
    .hero-carousel__arrow:hover {
      background: #fff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transform: translateY(-50%) scale(1.06);
    }
    .hero-carousel__arrow:active {
      transform: translateY(-50%) scale(0.96);
    }
    .hero-carousel__arrow--left { left: 20px; }
    .hero-carousel__arrow--right { right: 20px; }

    /* ===== NAV / DOTS ===== */
    .hero-carousel__nav {
      display: flex;
      justify-content: center;
      margin-top: var(--spacing-lg);
      position: absolute;
      bottom: var(--spacing-lg);
      left: 0;
      right: 0;
      z-index: 5;
      pointer-events: none;
    }
    .hero-carousel__dots {
      display: flex;
      gap: 10px;
      align-items: center;
      pointer-events: auto;
    }
    .hero-carousel__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.2);
      cursor: pointer;
      padding: 0;
      transition:
        all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-carousel__dot--active {
      background: var(--color-primary);
      width: 32px;
      border-radius: 4px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .hero-carousel {
        min-height: 460px;
      }
      .hero-carousel__slide {
        width: calc(100% - 140px);
      }
    }

    @media (max-width: 768px) {
      .hero-carousel {
        min-height: auto;
      }
      .hero-carousel__viewport {
        min-height: auto;
      }
      .hero-carousel__slide {
        position: relative;
        left: auto;
        top: auto;
        width: calc(100% - 32px);
        height: auto;
        min-height: auto;
        margin: 0 16px;
        border-radius: var(--radius-lg);
        transition: none;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        transform: none;
        opacity: 1;
        z-index: auto;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      }
      .hero-carousel__slide--active {
        display: block;
      }
      .hero-carousel__slide--next,
      .hero-carousel__slide--prev,
      .hero-carousel__slide--hidden {
        display: none;
      }
      .hero-carousel__arrow { display: none; }
      .hero-carousel__nav {
        position: relative;
        bottom: auto;
        margin-top: var(--spacing-md);
      }
      .hero-carousel__dot { background: var(--color-border); }
      .hero-carousel__dot--active { background: var(--color-primary); }
    }
  `],
})
export class HeroCarouselComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) items: any[] = [];
  @Input({ required: true }) template!: TemplateRef<any>;
  @Input() trackByFn: (index: number, item: any) => any = (i) => i;

  @ViewChild('viewport') viewportRef!: ElementRef<HTMLElement>;

  private autoPlayTimer?: ReturnType<typeof setInterval>;
  private isPaused = false;

  readonly activeIndex = signal(0);

  private touchStartX = 0;
  private touchEndX = 0;

  getPosition(i: number): 'active' | 'next' | 'prev' | 'hidden' {
    const len = this.items.length;
    if (len === 0) return 'hidden';
    if (i === this.activeIndex()) return 'active';
    if (i === (this.activeIndex() + 1) % len) return 'next';
    if (i === (this.activeIndex() - 1 + len) % len) return 'prev';
    return 'hidden';
  }

  ngAfterViewInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  prev(): void {
    const len = this.items.length;
    if (len <= 1) return;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  next(): void {
    const len = this.items.length;
    if (len <= 1) return;
    this.activeIndex.update((i) => (i + 1) % len);
  }

  goTo(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.activeIndex.set(index);
    }
  }

  onMouseEnter(): void {
    this.isPaused = true;
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
  }

  onMouseLeave(): void {
    this.isPaused = false;
    this.startAutoPlay();
  }

  private startAutoPlay(): void {
    if (this.autoPlayTimer) return;
    this.autoPlayTimer = setInterval(() => {
      if (!this.isPaused && this.items.length > 1) {
        this.next();
      }
    }, 5500);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd(): void {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.next();
      else this.prev();
    }
  }
}
