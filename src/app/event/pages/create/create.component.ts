import { Component, inject, OnInit, output, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../services/event.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { UserService } from '../../../user/services/user.service';
import { CATALOGUE_CODES, ENTITY_TYPE } from '../../../core/constants/app.constants';
import { CatalogueValue } from '../../../shared-domain/models/catalogue-value';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly imageService = inject(ImageService);
  private readonly authService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly created = output<void>();
  readonly cancelled = output<void>();

  readonly eventTypes = signal<CatalogueValue[]>([]);
  readonly visibilities = signal<CatalogueValue[]>([]);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly coverFile = signal<File | null>(null);
  readonly coverPreview = signal<string | null>(null);
  readonly coverRatioWarning = signal(false);

  form = signal({
    name: '',
    description: '',
    eventTypeId: null as number | null,
    eventVisibilityId: null as number | null,
    isPaid: false,
    price: null as number | null,
    maxAttendees: null as number | null,
    maxEntrepreneurships: null as number | null,
    virtualLink: '',
    startDatetime: '',
    endDatetime: '',
    countryId: null as number | null,
    provinceId: null as number | null,
    cityId: null as number | null,
    addressLine: '',
  });

  readonly user = signal<{ userId: number } | null>(null);

  ngOnInit(): void {
    this.loadCatalogues();
    this.loadUser();
  }

  loadCatalogues(): void {
    this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_TYPE).subscribe({
      next: (types) => this.eventTypes.set(types),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_VISIBILITY).subscribe({
      next: (vis) => this.visibilities.set(vis),
    });
  }

  loadUser(): void {
    const keycloakId = this.authService.authState().keycloakId;
    if (keycloakId) {
      this.userService.getByKeycloakId(keycloakId).subscribe({
        next: (user) => this.user.set(user),
      });
    }
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.coverFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.coverPreview.set(reader.result as string);
        this.checkCoverRatio(file);
      };
      reader.readAsDataURL(file);
    }
  }

  checkCoverRatio(file: File): void {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      this.coverRatioWarning.set(ratio < 1.5 || ratio > 2.5);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  removeCover(): void {
    this.coverFile.set(null);
    this.coverPreview.set(null);
    this.coverRatioWarning.set(false);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    const f = this.form();
    if (!f.name || !f.description || !f.startDatetime || !f.endDatetime || !f.eventTypeId || !f.eventVisibilityId) return;

    this.loading.set(true);
    try {
      const event = await lastValueFrom(this.eventService.create({
        createdByUserId: this.user()?.userId ?? 0,
        name: f.name,
        description: f.description,
        eventTypeId: f.eventTypeId,
        eventVisibilityId: f.eventVisibilityId,
        isPaid: f.isPaid,
        price: f.price ?? undefined,
        maxAttendees: f.maxAttendees ?? undefined,
        maxEntrepreneurships: f.maxEntrepreneurships ?? undefined,
        startDatetime: f.startDatetime,
        endDatetime: f.endDatetime,
        countryId: f.countryId ?? 1,
        provinceId: f.provinceId ?? 1,
        cityId: f.cityId ?? 1,
        addressLine: f.addressLine || undefined,
      }));

      if (this.coverFile()) {
        await lastValueFrom(this.imageService.upload(
          this.coverFile()!,
          ENTITY_TYPE.EVENT,
          event.eventId,
          0,
          'Cover de ' + event.name,
          this.user()?.userId,
        ));
      }

      this.created.emit();
      this.router.navigate(['/app/events', event.eventId]);
    } catch (err: any) {
      console.error('Error creating event:', err);
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.cancelled.emit();
    this.router.navigate(['/app/events']);
  }
}
