import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom, forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { EventService } from '../../services/event.service';
import { Event, EventSearchFilters } from '../../models/event';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import { CATALOGUE_CODES } from '../../../core/constants/app.constants';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { CreateComponent } from '../create/create.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { EntrepreneurshipService } from '../../../entrepreneurship/services/entrepreneurship.service';
import type { Entrepreneurship } from '../../../entrepreneurship/models/entrepreneurship';
import type { CreateEventInvitationDto, BulkCreateInvitationDto, EventInvitation } from '../../models/event-invitation';
import type { Page } from '../../../shared/models/pagination';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [NgIf, NgClass, DatePipe, RouterLink, FormsModule, ModalComponent, CreateComponent, ClickOutsideDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  readonly imageService = inject(ImageService);
  private readonly toastService = inject(ToastService);

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

  readonly showInviteModal = signal(false);
  readonly invitingEvent = signal<Event | null>(null);
  readonly searchQuery = signal('');
  readonly searchResults = signal<Entrepreneurship[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly searchLoading = signal(false);
  readonly inviting = signal(false);
  readonly inviteError = signal('');
  readonly inviteSuccess = signal('');
  readonly inviteMessage = signal('');
  readonly pendingStatusId = signal<number | null>(null);
  readonly rejectedStatusId = signal<number | null>(null);
  readonly acceptedStatusId = signal<number | null>(null);
  readonly statusMap = signal<Map<string, number>>(new Map());
  readonly statusById = signal<Map<number, { name: string; code: string }>>(new Map());
  readonly inviteTab = signal<'invitar' | 'ver'>('invitar');
  readonly modalInvitations = signal<EventInvitation[]>([]);
  readonly loadingInvitations = signal(false);
  readonly modalInvitationError = signal('');
  readonly modalInvitationSuccess = signal('');
  readonly deletingInvitationId = signal<number | null>(null);

  readonly showResendInvModal = signal(false);
  readonly resendInvMessage = signal('');
  readonly resendInvTarget = signal<EventInvitation | null>(null);
  readonly resendingInv = signal(false);

  readonly showRejectInvModal = signal(false);
  readonly rejectInvMessage = signal('');
  readonly rejectInvMessageError = signal('');
  readonly rejectInvTarget = signal<EventInvitation | null>(null);
  readonly rejectingInv = signal(false);

  private readonly searchSubject = new Subject<string>();

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
    this.loadInvitationStatus();
    this.loadEvents();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        this.searchLoading.set(true);
        return this.entrepreneurshipService.searchPage({ name: query || undefined, page: 0, size: 20 });
      }),
    ).subscribe({
      next: (page) => {
        this.searchResults.set(page.content);
        this.searchLoading.set(false);
      },
      error: () => this.searchLoading.set(false),
    });
  }

  private loadInvitationStatus(): void {
    this.catalogueService.getValuesByType(CATALOGUE_CODES.INVITATION_STATUS).subscribe({
      next: (statuses) => {
        const codeMap = new Map<string, number>();
        const idMap = new Map<number, { name: string; code: string }>();
        for (const s of statuses) {
          codeMap.set(s.code, s.catalogueValueId);
          idMap.set(s.catalogueValueId, { name: s.name || s.code, code: s.code });
        }
        this.statusMap.set(codeMap);
        this.statusById.set(idMap);
        const pendingId = codeMap.get('PENDING');
        if (pendingId !== undefined) this.pendingStatusId.set(pendingId);
        const rejId = codeMap.get('REJECTED');
        if (rejId !== undefined) this.rejectedStatusId.set(rejId);
        const accId = codeMap.get('ACCEPTED');
        if (accId !== undefined) this.acceptedStatusId.set(accId);
      },
    });
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
      this.toastService.success(`Evento "${event.name}" eliminado correctamente.`);
    } catch (err) {
      console.error('Error deleting event:', err);
      this.toastService.error('No se pudo eliminar el evento.');
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

  openInvitacionesModal(event: Event): void {
    this.invitingEvent.set(event);
    this.showInviteModal.set(true);
    this.inviteTab.set('invitar');
    this.openMenuEventId.set(null);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedIds.set(new Set());
    this.inviteError.set('');
    this.inviteSuccess.set('');
    this.inviteMessage.set('');
    this.modalInvitations.set([]);
    this.modalInvitationError.set('');
    this.modalInvitationSuccess.set('');
    this.searchSubject.next('');
  }

  closeInviteModal(): void {
    this.showInviteModal.set(false);
    this.invitingEvent.set(null);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedIds.set(new Set());
    this.modalInvitations.set([]);
  }

  switchInviteTab(tab: 'invitar' | 'ver'): void {
    this.inviteTab.set(tab);
    this.modalInvitationError.set('');
    this.modalInvitationSuccess.set('');
    if (tab === 'ver') {
      this.loadModalInvitations();
    }
  }

  loadModalInvitations(): void {
    const event = this.invitingEvent();
    if (!event) return;
    this.loadingInvitations.set(true);
    this.eventService.getInvitations(event.eventId).subscribe({
      next: (invitations) => {
        this.modalInvitations.set(invitations);
        this.loadingInvitations.set(false);
      },
      error: () => {
        this.loadingInvitations.set(false);
        this.modalInvitationError.set('Error al cargar las invitaciones');
      },
    });
  }

  private static readonly STATUS_NAME: Record<string, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptada',
    REJECTED: 'Rechazada',
  };

  statusName(statusId: number): string {
    const entry = this.statusById().get(statusId);
    if (entry) return ListComponent.STATUS_NAME[entry.code] || entry.name;
    return 'Desconocido';
  }

  statusClass(statusId: number): string {
    const entry = this.statusById().get(statusId);
    const code = entry?.code ?? '';
    const classes: Record<string, string> = {
      PENDING: 'invite-modal__status--pending',
      ACCEPTED: 'invite-modal__status--accepted',
      REJECTED: 'invite-modal__status--rejected',
    };
    return classes[code] ?? '';
  }

  deleteModalInvitation(invitationId: number): void {
    this.deletingInvitationId.set(invitationId);
    this.eventService.deleteInvitation(invitationId).subscribe({
      next: () => {
        this.modalInvitations.update((list) => list.filter((i) => i.invitationId !== invitationId));
        this.modalInvitationSuccess.set('Invitación eliminada correctamente');
        this.toastService.success('Invitación eliminada correctamente.');
        this.deletingInvitationId.set(null);
      },
      error: () => {
        this.modalInvitationError.set('Error al eliminar la invitación');
        this.toastService.error('No se pudo eliminar la invitación.');
        this.deletingInvitationId.set(null);
      },
    });
  }

  openResendInvModal(inv: EventInvitation): void {
    this.resendInvTarget.set(inv);
    this.resendInvMessage.set('');
    this.showResendInvModal.set(true);
  }

  closeResendInvModal(): void {
    this.showResendInvModal.set(false);
    this.resendInvTarget.set(null);
    this.resendInvMessage.set('');
  }

  confirmResendInv(): void {
    const inv = this.resendInvTarget();
    const pendingId = this.pendingStatusId();
    if (!inv || !pendingId) return;

    this.resendingInv.set(true);
    this.eventService.updateInvitationStatus(inv.invitationId, pendingId, this.resendInvMessage().trim() || undefined).subscribe({
      next: () => {
        this.loadModalInvitations();
        this.modalInvitationSuccess.set('Invitación reenviada correctamente');
        this.toastService.success('Invitación reenviada correctamente.');
        this.closeResendInvModal();
      },
      error: () => {
        this.modalInvitationError.set('Error al reenviar la invitación');
        this.toastService.error('No se pudo reenviar la invitación.');
        this.resendingInv.set(false);
      },
    });
  }

  openRejectInvModal(inv: EventInvitation): void {
    this.rejectInvTarget.set(inv);
    this.rejectInvMessage.set('');
    this.rejectInvMessageError.set('');
    this.showRejectInvModal.set(true);
  }

  closeRejectInvModal(): void {
    this.showRejectInvModal.set(false);
    this.rejectInvTarget.set(null);
    this.rejectInvMessage.set('');
    this.rejectInvMessageError.set('');
  }

  confirmRejectInv(): void {
    const inv = this.rejectInvTarget();
    const rejectedId = this.rejectedStatusId();
    const msg = this.rejectInvMessage().trim();
    if (!inv || !rejectedId) return;

    if (!msg) {
      this.rejectInvMessageError.set('La justificación de rechazo es obligatoria');
      return;
    }

    this.rejectingInv.set(true);
    this.rejectInvMessageError.set('');
    this.eventService.updateInvitationStatus(inv.invitationId, rejectedId, msg).subscribe({
      next: () => {
        this.loadModalInvitations();
        this.modalInvitationSuccess.set('Invitación rechazada correctamente');
        this.toastService.success('Invitación rechazada correctamente.');
        this.closeRejectInvModal();
      },
      error: () => {
        this.modalInvitationError.set('Error al rechazar la invitación');
        this.toastService.error('No se pudo rechazar la invitación.');
        this.rejectingInv.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  toggleSelection(id: number): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async sendInvitations(): Promise<void> {
    const event = this.invitingEvent();
    const ids = Array.from(this.selectedIds());
    const pendingId = this.pendingStatusId();
    const message = this.inviteMessage().trim();
    if (!event || ids.length === 0) return;
    if (!pendingId) {
      this.inviteError.set('Error: no se encontró el estado PENDING en el catálogo');
      return;
    }

    this.inviting.set(true);
    this.inviteError.set('');
    this.inviteSuccess.set('');

    const nameMap = new Map(this.searchResults().map((e) => [e.entrepreneurshipId, e.name]));

    const invitations: CreateEventInvitationDto[] = ids.map((entrepreneurshipId) => ({
      eventId: event.eventId,
      entrepreneurshipId,
      invitationStatusId: pendingId,
      message: message || undefined,
      email: null,
    }));

    try {
      const bulkDto: BulkCreateInvitationDto = { invitations };
      await lastValueFrom(this.eventService.createInvitationsBulk(bulkDto));

      this.selectedIds.set(new Set());
      this.inviteMessage.set('');

      this.inviteSuccess.set(
        `Invitación${ids.length > 1 ? 'es' : ''} enviada${ids.length > 1 ? 's' : ''} correctamente a ${ids.length} emprendimiento${ids.length > 1 ? 's' : ''}.`,
      );
      this.toastService.success(
        `Invitación${ids.length > 1 ? 'es' : ''} enviada${ids.length > 1 ? 's' : ''} correctamente.`,
      );
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 409) {
        const alreadyIn = ids.map((id) => nameMap.get(id) || `ID ${id}`);
        this.inviteError.set(
          `${alreadyIn.join(', ')} ya ${alreadyIn.length > 1 ? 'estaban' : 'estaba'} invitado${alreadyIn.length > 1 ? 's' : ''} a este evento.`,
        );
        this.toastService.warning('Algunos emprendimientos ya estaban invitados a este evento.');
      } else {
        this.inviteError.set('Error al enviar las invitaciones');
        this.toastService.error('No se pudieron enviar las invitaciones.');
      }
    } finally {
      this.inviting.set(false);
    }
  }
}
