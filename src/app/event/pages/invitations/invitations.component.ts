import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { EventService } from '../../services/event.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { EntrepreneurshipService } from '../../../entrepreneurship/services/entrepreneurship.service';
import { CATALOGUE_CODES } from '../../../core/constants/app.constants';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import type { EventInvitation, CreateEventInvitationDto, BulkCreateInvitationDto } from '../../models/event-invitation';
import type { Event } from '../../models/event';
import type { Entrepreneurship } from '../../../entrepreneurship/models/entrepreneurship';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';

const STATUS_NAME: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'badge--warning',
  ACCEPTED: 'badge--success',
  REJECTED: 'badge--danger',
};

@Component({
  selector: 'app-event-invitations',
  standalone: true,
  imports: [NgClass, DatePipe, RouterLink, FormsModule, ModalComponent],
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.scss',
})
export class InvitationsComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly authService = inject(AuthenticationService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);

  readonly events = signal<Event[]>([]);
  readonly invitationsMap = signal<Map<number, EventInvitation[]>>(new Map());
  readonly expandedEventId = signal<number | null>(null);
  readonly loadingEvents = signal(true);
  readonly loadingInvitations = signal<Set<number>>(new Set());
  readonly error = signal('');
  readonly deletingId = signal<number | null>(null);

  readonly showResendModal = signal(false);
  readonly resendMessage = signal('');
  readonly resendingInv = signal<EventInvitation | null>(null);
  readonly resending = signal(false);

  readonly showRejectModal = signal(false);
  readonly rejectMessage = signal('');
  readonly rejectMessageError = signal('');
  readonly rejectingInv = signal<EventInvitation | null>(null);
  readonly rejecting = signal(false);

  private statusMap = new Map<string, number>();
  private readonly searchSubject = new Subject<string>();
  readonly acceptedStatusId = signal<number | null>(null);

  readonly showAppInviteModal = signal(false);
  readonly invitingEventForModal = signal<Event | null>(null);
  readonly inviteTab = signal<'invitar' | 'ver'>('invitar');
  readonly searchQuery = signal('');
  readonly searchResults = signal<Entrepreneurship[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly searchLoading = signal(false);
  readonly invitingBulk = signal(false);
  readonly inviteError = signal('');
  readonly inviteSuccess = signal('');
  readonly inviteMessageText = signal('');

  readonly modalInvitations = signal<EventInvitation[]>([]);
  readonly loadingModalInvitations = signal(false);
  readonly modalInvitationError = signal('');
  readonly modalInvitationSuccess = signal('');

  ngOnInit(): void {
    this.loadStatusesAndEvents();
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

  private async loadStatusesAndEvents(): Promise<void> {
    this.loadingEvents.set(true);
    this.error.set('');
    try {
      const statuses = await lastValueFrom(
        this.catalogueService.getValuesByType(CATALOGUE_CODES.INVITATION_STATUS),
      );
      this.statusMap = new Map(
        statuses.map((s: CatalogueValue) => [s.code, s.catalogueValueId]),
      );
      statuses.forEach((s: CatalogueValue) => {
        if (s.name && !this.statusMap.has(s.name.toUpperCase())) {
          this.statusMap.set(s.name.toUpperCase(), s.catalogueValueId);
        }
      });
      this.acceptedStatusId.set(this.statusMap.get('ACCEPTED') ?? null);

      const userId = this.authService.backendUserId();
      if (!userId) {
        this.error.set('No se pudo identificar al usuario');
        return;
      }
      const events = await lastValueFrom(this.eventService.getByCreator(userId));
      this.events.set(events);
    } catch {
      this.error.set('Error al cargar los eventos');
    } finally {
      this.loadingEvents.set(false);
    }
  }

  async toggleEvent(eventId: number): Promise<void> {
    if (this.expandedEventId() === eventId) {
      this.expandedEventId.set(null);
      return;
    }
    this.expandedEventId.set(eventId);

    if (!this.invitationsMap().has(eventId)) {
      await this.loadInvitations(eventId);
    }
  }

  private async loadInvitations(eventId: number): Promise<void> {
    this.loadingInvitations.update((s) => new Set(s).add(eventId));
    try {
      const invitations = await lastValueFrom(this.eventService.getInvitations(eventId));
      this.invitationsMap.update((map) => {
        const next = new Map(map);
        next.set(eventId, invitations);
        return next;
      });
    } catch {
      this.error.set('Error al cargar las invitaciones');
    } finally {
      this.loadingInvitations.update((s) => {
        const next = new Set(s);
        next.delete(eventId);
        return next;
      });
    }
  }

  entrepreneurshipName(inv: EventInvitation): string {
    return inv.entrepreneurship?.name || `Emprendimiento #${inv.entrepreneurshipId}`;
  }

  entrepreneurshipImage(inv: EventInvitation): string | null {
    return inv.entrepreneurship?.imageUrl || null;
  }

  statusClass(statusId: number): string {
    const code = this.codeById(statusId);
    return STATUS_CLASS[code] ?? '';
  }

  statusName(statusId: number): string {
    for (const [code, valueId] of this.statusMap) {
      if (valueId === statusId) return STATUS_NAME[code] || code.charAt(0) + code.slice(1).toLowerCase();
    }
    return 'Desconocido';
  }

  getEventImageUrl(event: Event): string {
    return this.imageService.getEntityImageUrl(event, 'EVENT', event.eventId);
  }

  eventInitial(event: Event): string {
    return (event.name || '?')[0]?.toUpperCase() || '?';
  }

  locationStr(event: Event): string {
    return [event.cityName, event.provinceName, event.countryName].filter(Boolean).join(', ');
  }

  openInviteModal(event: Event): void {
    this.invitingEventForModal.set(event);
    this.showAppInviteModal.set(true);
    this.inviteTab.set('invitar');
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedIds.set(new Set());
    this.inviteError.set('');
    this.inviteSuccess.set('');
    this.inviteMessageText.set('');
    this.modalInvitations.set([]);
    this.modalInvitationError.set('');
    this.modalInvitationSuccess.set('');
    this.searchSubject.next('');
  }

  closeInviteModal(): void {
    this.showAppInviteModal.set(false);
    this.invitingEventForModal.set(null);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedIds.set(new Set());
    this.modalInvitations.set([]);
  }

  switchInviteTab(tab: 'invitar' | 'ver'): void {
    this.inviteTab.set(tab);
    this.modalInvitationError.set('');
    this.modalInvitationSuccess.set('');
    if (tab === 'ver') this.loadModalInvitations();
  }

  loadModalInvitations(): void {
    const event = this.invitingEventForModal();
    if (!event) return;
    this.loadingModalInvitations.set(true);
    this.eventService.getInvitations(event.eventId).subscribe({
      next: (invitations) => {
        this.modalInvitations.set(invitations);
        this.loadingModalInvitations.set(false);
      },
      error: () => {
        this.loadingModalInvitations.set(false);
        this.modalInvitationError.set('Error al cargar las invitaciones');
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

  async sendBulkInvitations(): Promise<void> {
    const event = this.invitingEventForModal();
    const ids = Array.from(this.selectedIds());
    const pendingId = this.statusMap.get('PENDING');
    const message = this.inviteMessageText().trim();
    if (!event || ids.length === 0) return;
    if (!pendingId) {
      this.inviteError.set('Error: no se encontró el estado PENDING');
      return;
    }

    this.invitingBulk.set(true);
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
      this.inviteMessageText.set('');
      this.inviteSuccess.set(
        `Invitación${ids.length > 1 ? 'es' : ''} enviada${ids.length > 1 ? 's' : ''} correctamente a ${ids.length} emprendimiento${ids.length > 1 ? 's' : ''}.`,
      );
      await this.loadInvitations(event.eventId);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 409) {
        const alreadyIn = ids.map((id) => nameMap.get(id) || `ID ${id}`);
        this.inviteError.set(
          `${alreadyIn.join(', ')} ya ${alreadyIn.length > 1 ? 'estaban' : 'estaba'} invitado${alreadyIn.length > 1 ? 's' : ''} a este evento.`,
        );
      } else {
        this.inviteError.set('Error al enviar las invitaciones');
      }
    } finally {
      this.invitingBulk.set(false);
    }
  }

  private codeById(id: number): string {
    for (const [code, valueId] of this.statusMap) {
      if (valueId === id) return code;
    }
    return '';
  }

  async deleteInvitation(id: number): Promise<void> {
    this.deletingId.set(id);
    try {
      await lastValueFrom(this.eventService.deleteInvitation(id));
      this.invitationsMap.update((map) => {
        const next = new Map(map);
        for (const [eventId, invs] of next) {
          next.set(eventId, invs.filter((i) => i.invitationId !== id));
        }
        return next;
      });
    } catch {
      this.error.set('Error al eliminar la invitación');
    } finally {
      this.deletingId.set(null);
    }
  }

  openResendModal(inv: EventInvitation): void {
    this.resendingInv.set(inv);
    this.resendMessage.set('');
    this.showResendModal.set(true);
  }

  closeResendModal(): void {
    this.showResendModal.set(false);
    this.resendingInv.set(null);
    this.resendMessage.set('');
  }

  async confirmResend(): Promise<void> {
    const inv = this.resendingInv();
    const pendingId = this.statusMap.get('PENDING');
    if (!inv || !pendingId) return;

    this.resending.set(true);
    try {
      await lastValueFrom(
        this.eventService.updateInvitationStatus(inv.invitationId, pendingId, this.resendMessage().trim() || undefined),
      );
      this.invitationsMap.update((map) => {
        const next = new Map(map);
        for (const [eventId, invs] of next) {
          next.set(
            eventId,
            invs.map((i) =>
              i.invitationId === inv.invitationId
                ? { ...i, invitationStatusId: pendingId, sentAt: new Date().toISOString() }
                : i,
            ),
          );
        }
        return next;
      });
      this.closeResendModal();
    } catch {
      this.error.set('Error al reenviar la invitación');
    } finally {
      this.resending.set(false);
    }
  }

  openRejectModal(inv: EventInvitation): void {
    this.rejectingInv.set(inv);
    this.rejectMessage.set('');
    this.rejectMessageError.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectingInv.set(null);
    this.rejectMessage.set('');
    this.rejectMessageError.set('');
  }

  async confirmReject(): Promise<void> {
    const inv = this.rejectingInv();
    const rejectedId = this.statusMap.get('REJECTED');
    const msg = this.rejectMessage().trim();
    if (!inv || !rejectedId) return;

    if (!msg) {
      this.rejectMessageError.set('La justificación de rechazo es obligatoria');
      return;
    }

    this.rejecting.set(true);
    this.rejectMessageError.set('');
    try {
      await lastValueFrom(
        this.eventService.updateInvitationStatus(inv.invitationId, rejectedId, msg),
      );
      this.invitationsMap.update((map) => {
        const next = new Map(map);
        for (const [eventId, invs] of next) {
          next.set(
            eventId,
            invs.map((i) =>
              i.invitationId === inv.invitationId
                ? { ...i, invitationStatusId: rejectedId }
                : i,
            ),
          );
        }
        return next;
      });
      this.closeRejectModal();
    } catch {
      this.error.set('Error al rechazar la invitación');
    } finally {
      this.rejecting.set(false);
    }
  }
}
