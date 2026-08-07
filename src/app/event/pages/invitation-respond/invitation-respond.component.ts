import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../services/event.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CATALOGUE_CODES } from '../../../core/constants/app.constants';
import type { EventInvitation } from '../../models/event-invitation';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';

@Component({
  selector: 'app-invitation-respond',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './invitation-respond.component.html',
  styleUrl: './invitation-respond.component.scss',
})
export class InvitationRespondComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly toastService = inject(ToastService);

  readonly invitation = signal<EventInvitation | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly actionLoading = signal(false);
  readonly actionDone = signal(false);
  readonly actionResult = signal<'accepted' | 'rejected' | null>(null);
  readonly alreadyResponded = signal(false);

  readonly showRejectModal = signal(false);
  readonly rejectMessage = signal('');
  readonly rejectMessageError = signal('');

  private statusMap = new Map<string, number>();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID de invitación inválido');
      this.loading.set(false);
      return;
    }
    this.loadInvitation(id);
  }

  private async loadInvitation(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [statuses] = await Promise.all([
        lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.INVITATION_STATUS)),
      ]);
      for (const s of statuses as CatalogueValue[]) {
        this.statusMap.set(s.code, s.catalogueValueId);
      }

      const invitation = await lastValueFrom(this.eventService.getInvitationById(id));
      this.invitation.set(invitation);

      if (invitation.invitationStatusId !== this.statusMap.get('PENDING')) {
        this.alreadyResponded.set(true);
      }
    } catch {
      this.error.set('No se pudo cargar la información de la invitación');
    } finally {
      this.loading.set(false);
    }
  }

  async accept(): Promise<void> {
    const inv = this.invitation();
    const acceptedId = this.statusMap.get('ACCEPTED');
    if (!inv || !acceptedId) return;

    this.actionLoading.set(true);
    this.error.set('');
    try {
      await lastValueFrom(
        this.eventService.updateInvitationStatus(inv.invitationId, acceptedId),
      );
      this.actionResult.set('accepted');
      this.actionDone.set(true);
      this.toastService.success('Invitación aceptada correctamente.');
    } catch {
      this.error.set('Error al aceptar la invitación');
      this.toastService.error('No se pudo aceptar la invitación.');
    } finally {
      this.actionLoading.set(false);
    }
  }

  openRejectModal(): void {
    this.rejectMessage.set('');
    this.rejectMessageError.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectMessage.set('');
    this.rejectMessageError.set('');
  }

  async confirmReject(): Promise<void> {
    const inv = this.invitation();
    const rejectedId = this.statusMap.get('REJECTED');
    const msg = this.rejectMessage().trim();
    if (!inv || !rejectedId) return;

    if (!msg) {
      this.rejectMessageError.set('Debes indicar el motivo del rechazo');
      return;
    }

    this.actionLoading.set(true);
    this.error.set('');
    this.rejectMessageError.set('');
    try {
      await lastValueFrom(
        this.eventService.updateInvitationStatus(inv.invitationId, rejectedId, msg),
      );
      this.actionResult.set('rejected');
      this.actionDone.set(true);
      this.showRejectModal.set(false);
      this.toastService.success('Invitación rechazada correctamente.');
    } catch {
      this.error.set('Error al rechazar la invitación');
      this.toastService.error('No se pudo rechazar la invitación.');
    } finally {
      this.actionLoading.set(false);
    }
  }

  get eventName(): string {
    return this.invitation()?.eventName || 'Evento';
  }

  get entrepreneurshipName(): string {
    return this.invitation()?.entrepreneurship?.name || 'Emprendimiento';
  }

}
