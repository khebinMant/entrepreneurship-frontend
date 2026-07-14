import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Event, EventSearchFilters } from '../../models/event';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import { CATALOGUE_CODES } from '../../../core/constants/app.constants';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { CreateComponent } from '../create/create.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import type { Page } from '../../../shared/models/pagination';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink, FormsModule, ModalComponent, CreateComponent, ClickOutsideDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  readonly imageService = inject(ImageService);

  readonly events = signal<Event[]>([]);
  readonly eventTypes = signal<CatalogueValue[]>([]);
  readonly visibilities = signal<CatalogueValue[]>([]);
  readonly loading = signal(false);
  readonly pageData = signal<Pick<Page<Event>, 'totalElements' | 'totalPages' | 'number' | 'size'> | null>(null);
  readonly showCreateModal = signal(false);
  readonly showEditModal = signal(false);
  readonly editingEvent = signal<Event | null>(null);
  readonly showDeleteConfirm = signal(false);
  readonly deletingEvent = signal<Event | null>(null);
  readonly deleting = signal(false);
  readonly openMenuEventId = signal<number | null>(null);

  readonly pageSize = 10;

  filters = signal<EventSearchFilters>({
    name: '',
    eventTypeId: undefined,
    eventVisibilityId: undefined,
    fromDate: '',
    toDate: '',
    page: 0,
    size: this.pageSize,
  });

  ngOnInit(): void {
    this.loadCatalogues();
    this.loadEvents();
  }

  loadCatalogues(): void {
    forkJoin({
      types: this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_TYPE),
      visibilities: this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_VISIBILITY),
    }).subscribe({
      next: (result) => {
        this.eventTypes.set(result.types);
        this.visibilities.set(result.visibilities);
      },
    });
  }

  isAppRoute(): boolean {
    return this.router.url.startsWith('/app/');
  }

  loadEvents(): void {
    this.loading.set(true);
    const currentFilters = this.filters();

    const obs$ = this.isAppRoute()
      ? this.eventService.searchPageByCreator(this.authService.backendUserId()!, {
          ...currentFilters,
          name: currentFilters.name || undefined,
          eventTypeId: currentFilters.eventTypeId || undefined,
          eventVisibilityId: currentFilters.eventVisibilityId || undefined,
          fromDate: currentFilters.fromDate || undefined,
          toDate: currentFilters.toDate || undefined,
          page: currentFilters.page ?? 0,
          size: currentFilters.size ?? this.pageSize,
        })
      : this.eventService.searchPage({
          ...currentFilters,
          name: currentFilters.name || undefined,
          eventTypeId: currentFilters.eventTypeId || undefined,
          eventVisibilityId: currentFilters.eventVisibilityId || undefined,
          fromDate: currentFilters.fromDate || undefined,
          toDate: currentFilters.toDate || undefined,
          page: currentFilters.page ?? 0,
          size: currentFilters.size ?? this.pageSize,
        });

    obs$.subscribe({
      next: (page) => {
        this.events.set(page.content);
        this.pageData.set({
          totalElements: page.totalElements,
          totalPages: page.totalPages,
          number: page.number,
          size: page.size,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.filters.update((f) => ({ ...f, page: 0 }));
    this.loadEvents();
  }

  onFilterChange(): void {
    this.filters.update((f) => ({ ...f, page: 0 }));
    this.loadEvents();
  }

  goToPage(page: number): void {
    this.filters.update((f) => ({ ...f, page }));
    this.loadEvents();
  }

  getPageNumbers(): number[] {
    const data = this.pageData();
    if (!data) return [];
    const total = data.totalPages;
    const current = data.number;
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getImageUrl(event: Event): string {
    return this.imageService.getEntityImageUrl(event, 'EVENT', event.eventId);
  }

  trackById(index: number, item: Event): number {
    return item.eventId;
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.loadEvents();
  }

  openEditModal(event: Event): void {
    this.editingEvent.set(event);
    this.showEditModal.set(true);
    this.openMenuEventId.set(null);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingEvent.set(null);
    this.loadEvents();
  }

  openDeleteConfirm(event: Event): void {
    this.deletingEvent.set(event);
    this.showDeleteConfirm.set(true);
    this.openMenuEventId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingEvent.set(null);
  }

  async confirmDelete(): Promise<void> {
    const event = this.deletingEvent();
    if (!event) return;
    this.deleting.set(true);
    try {
      await lastValueFrom(this.eventService.delete(event.eventId));
      this.showDeleteConfirm.set(false);
      this.deletingEvent.set(null);
      this.loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      this.deleting.set(false);
    }
  }

  toggleMenu(eventId: number): void {
    this.openMenuEventId.update(current => current === eventId ? null : eventId);
  }

  closeMenu(): void {
    this.openMenuEventId.set(null);
  }
}
