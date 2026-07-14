import { Component, output, input, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="modal-overlay" *ngIf="visible()" (click)="onOverlayClick($event)">
      <div class="modal-container modal-container--{{ size() }}">
        <div class="modal-header" *ngIf="showHeader()">
          <h3 class="modal-title">{{ title() }}</h3>
          <button class="modal-close" (click)="close.emit()" aria-label="Cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: var(--spacing-xxl) var(--spacing-md);
      z-index: 1000;
      overflow-y: auto;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease;
    }
    .modal-container {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      width: 100%;
      animation: slideUp 0.25s ease;
      overflow: hidden;
    }
    .modal-container--sm { max-width: 480px; }
    .modal-container--md { max-width: 640px; }
    .modal-container--lg { max-width: 860px; }
    .modal-container--xl { max-width: 1100px; }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
    }
    .modal-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
    .modal-close {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      font-size: 14px;
    }
    .modal-close:hover {
      background: var(--color-surface-alt);
      color: var(--color-text-primary);
    }
    .modal-body {
      padding: var(--spacing-lg);
    }
  `],
})
export class ModalComponent {
  readonly visible = input(false);
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly showHeader = input(true);
  readonly closeOnOverlay = input(true);

  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) {
      this.close.emit();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay() && (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
