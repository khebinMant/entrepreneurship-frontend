import { Component, inject, input, OnInit, output, signal, computed } from '@angular/core';
import { NgIf } from '@angular/common';
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
import { Event as EventModel } from '../../models/event';
import { ImageGallery } from '../../../shared-domain/models/image-gallery';

const MAX_IMAGES = 20;

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [NgIf, FormsModule],
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
  readonly editingEvent = input<EventModel | null>(null);

  readonly isEditMode = computed(() => !!this.editingEvent());

  readonly eventTypes = signal<CatalogueValue[]>([]);
  readonly visibilities = signal<CatalogueValue[]>([]);
  readonly countries = signal<CatalogueValue[]>([]);
  readonly provinces = signal<CatalogueValue[]>([]);
  readonly cities = signal<CatalogueValue[]>([]);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly coverFile = signal<File | null>(null);
  readonly coverPreview = signal<string | null>(null);
  readonly coverRatioWarning = signal(false);
  readonly touched = signal<Record<string, boolean>>({});
  readonly loadingProvinces = signal(false);
  readonly loadingCities = signal(false);
  readonly existingImages = signal<ImageGallery[]>([]);
  readonly imagesLoading = signal(false);
  readonly uploadingImage = signal(false);

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

  readonly errors = computed(() => {
    const f = this.form();
    const t = this.touched();
    const s = this.submitted();
    const show = (field: string) => t[field] || s;

    return {
      name: show('name')
        ? !f.name ? 'El nombre es obligatorio'
        : f.name.length > 150 ? 'El nombre no puede exceder 150 caracteres'
        : '' : '',
      description: show('description') && !f.description ? 'La descripción es obligatoria' : '',
      eventTypeId: show('eventTypeId') && !f.eventTypeId ? 'El tipo de evento es obligatorio' : '',
      eventVisibilityId: show('eventVisibilityId') && !f.eventVisibilityId ? 'La visibilidad es obligatoria' : '',
      startDatetime: show('startDatetime') && !f.startDatetime ? 'La fecha de inicio es obligatoria' : '',
      endDatetime: show('endDatetime') && !f.endDatetime ? 'La fecha de fin es obligatoria'
        : show('endDatetime') && f.endDatetime && f.startDatetime && f.endDatetime <= f.startDatetime ? 'La fecha de fin debe ser posterior al inicio' : '',
      price: show('price') && f.isPaid && (!f.price || f.price <= 0) ? 'Debe ingresar un precio válido' : '',
      maxAttendees: show('maxAttendees') && f.maxAttendees !== null && f.maxAttendees < 0 ? 'No puede ser negativo' : '',
      maxEntrepreneurships: show('maxEntrepreneurships') && f.maxEntrepreneurships !== null && f.maxEntrepreneurships < 0 ? 'No puede ser negativo' : '',
      cover: show('cover') && !this.isEditMode() && !this.coverFile() ? 'La imagen de portada es obligatoria' : '',
    };
  });

  readonly isValid = computed(() => {
    const f = this.form();
    const base = !!(f.name && f.name.length <= 150 && f.description && f.eventTypeId && f.eventVisibilityId
      && f.startDatetime && f.endDatetime
      && (!f.isPaid || (f.price && f.price > 0))
      && (f.maxAttendees === null || f.maxAttendees >= 0)
      && (f.maxEntrepreneurships === null || f.maxEntrepreneurships >= 0));
    if (this.isEditMode()) return base;
    return base && !!this.coverFile();
  });

  readonly maxImages = MAX_IMAGES;
  readonly canAddMoreImages = computed(() => this.existingImages().length < MAX_IMAGES);

  ngOnInit(): void {
    this.loadCatalogues();
    this.loadUser();
  }

  private loadCatalogues(): void {
    this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_TYPE).subscribe({
      next: (types) => this.eventTypes.set(types),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_VISIBILITY).subscribe({
      next: (vis) => this.visibilities.set(vis),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.COUNTRY).subscribe({
      next: (countries) => {
        this.countries.set(countries);
        const event = this.editingEvent();
        if (event) this.afterCountriesLoaded(event);
      },
    });
  }

  private afterCountriesLoaded(event: EventModel): void {
    this.populateForm(event);
    if (event.countryId) this.loadProvinces(event.countryId, event.provinceId);
    if (event.eventId) this.loadExistingImages(event.eventId);
  }

  private populateForm(event: EventModel): void {
    this.form.set({
      name: event.name || '',
      description: event.description || '',
      eventTypeId: event.eventTypeId || null,
      eventVisibilityId: event.eventVisibilityId || null,
      isPaid: event.isPaid,
      price: event.price ?? null,
      maxAttendees: event.maxAttendees ?? null,
      maxEntrepreneurships: event.maxEntrepreneurships ?? null,
      virtualLink: '',
      startDatetime: event.startDatetime ? event.startDatetime.slice(0, 16) : '',
      endDatetime: event.endDatetime ? event.endDatetime.slice(0, 16) : '',
      countryId: event.countryId || null,
      provinceId: event.provinceId || null,
      cityId: event.cityId || null,
      addressLine: event.addressLine || '',
    });
  }

  private loadProvinces(countryId: number, selectedProvinceId?: number): void {
    this.loadingProvinces.set(true);
    this.catalogueService.getValueChildren(countryId).subscribe({
      next: (provinces) => {
        this.provinces.set(provinces);
        this.loadingProvinces.set(false);
        if (selectedProvinceId) this.loadCities(selectedProvinceId);
      },
      error: () => this.loadingProvinces.set(false),
    });
  }

  private loadCities(provinceId: number): void {
    this.loadingCities.set(true);
    this.catalogueService.getValueChildren(provinceId).subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.loadingCities.set(false);
      },
      error: () => this.loadingCities.set(false),
    });
  }

  private loadExistingImages(eventId: number): void {
    this.imagesLoading.set(true);
    this.imageService.list('EVENT', eventId).subscribe({
      next: (images) => {
        this.existingImages.set(images);
        this.imagesLoading.set(false);
      },
      error: () => this.imagesLoading.set(false),
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

  onCountryChange(countryId: number | null): void {
    this.form.update(f => ({ ...f, countryId, provinceId: null, cityId: null }));
    this.provinces.set([]);
    this.cities.set([]);
    if (!countryId) return;
    this.loadingProvinces.set(true);
    this.catalogueService.getValueChildren(countryId).subscribe({
      next: (provinces) => {
        this.provinces.set(provinces);
        this.loadingProvinces.set(false);
      },
      error: () => this.loadingProvinces.set(false),
    });
  }

  onProvinceChange(provinceId: number | null): void {
    this.form.update(f => ({ ...f, provinceId, cityId: null }));
    this.cities.set([]);
    if (!provinceId) return;
    this.loadingCities.set(true);
    this.catalogueService.getValueChildren(provinceId).subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.loadingCities.set(false);
      },
      error: () => this.loadingCities.set(false),
    });
  }

  markTouched(field: string): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.coverFile.set(file);
      this.markTouched('cover');
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

  onGalleryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadGalleryImage(file);
    input.value = '';
  }

  private async uploadGalleryImage(file: File): Promise<void> {
    const eventId = this.editingEvent()?.eventId;
    if (!eventId) return;
    this.uploadingImage.set(true);
    try {
      await lastValueFrom(this.imageService.upload(
        file,
        'EVENT',
        eventId,
        this.existingImages().length + 1,
        file.name,
        this.user()?.userId,
      ));
      this.loadExistingImages(eventId);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      this.uploadingImage.set(false);
    }
  }

  deleteImage(imageId: number): void {
    const eventId = this.editingEvent()?.eventId;
    if (!eventId) return;
    this.imageService.delete(imageId, 'EVENT', eventId).subscribe({
      next: () => this.loadExistingImages(eventId),
      error: (err) => console.error('Error deleting image:', err),
    });
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    const allFields = this.isEditMode()
      ? ['name', 'description', 'eventTypeId', 'eventVisibilityId', 'startDatetime', 'endDatetime', 'price', 'maxAttendees', 'maxEntrepreneurships']
      : ['name', 'description', 'eventTypeId', 'eventVisibilityId', 'startDatetime', 'endDatetime', 'price', 'maxAttendees', 'maxEntrepreneurships', 'cover'];
    this.touched.update(t => {
      const updated = { ...t };
      for (const field of allFields) updated[field] = true;
      return updated;
    });
    if (!this.isValid()) return;

    this.loading.set(true);
    const f = this.form();
    const currentUser = this.user();
    try {
      if (this.isEditMode()) {
        const event = this.editingEvent()!;
        await lastValueFrom(this.eventService.update(event.eventId, {
          createdByUserId: event.createdByUserId,
          name: f.name,
          description: f.description,
          eventTypeId: f.eventTypeId!,
          eventVisibilityId: f.eventVisibilityId!,
          isPaid: f.isPaid,
          price: f.isPaid ? f.price! : undefined,
          maxAttendees: f.maxAttendees ?? undefined,
          maxEntrepreneurships: f.maxEntrepreneurships ?? undefined,
          startDatetime: f.startDatetime + ':00',
          endDatetime: f.endDatetime + ':00',
          countryId: f.countryId ?? undefined,
          provinceId: f.provinceId ?? undefined,
          cityId: f.cityId ?? undefined,
          addressLine: f.addressLine || undefined,
        }));

        if (this.coverFile()) {
          await lastValueFrom(this.imageService.upload(
            this.coverFile()!,
            ENTITY_TYPE.EVENT,
            event.eventId,
            0,
            'Cover de ' + event.name,
            currentUser?.userId,
          ));
        }

        this.created.emit();
        this.router.navigate(['/app/events', event.eventId]);
      } else {
        const event = await lastValueFrom(this.eventService.create({
          createdByUserId: currentUser?.userId ?? 0,
          name: f.name,
          description: f.description,
          eventTypeId: f.eventTypeId!,
          eventVisibilityId: f.eventVisibilityId!,
          isPaid: f.isPaid,
          price: f.isPaid ? f.price! : undefined,
          maxAttendees: f.maxAttendees ?? undefined,
          maxEntrepreneurships: f.maxEntrepreneurships ?? undefined,
          startDatetime: f.startDatetime + ':00',
          endDatetime: f.endDatetime + ':00',
          countryId: f.countryId ?? 0,
          provinceId: f.provinceId ?? 0,
          cityId: f.cityId ?? 0,
          addressLine: f.addressLine || undefined,
        }));

        if (this.coverFile()) {
          await lastValueFrom(this.imageService.upload(
            this.coverFile()!,
            ENTITY_TYPE.EVENT,
            event.eventId,
            0,
            'Cover de ' + event.name,
            currentUser?.userId,
          ));
        }

        this.created.emit();
        this.router.navigate(['/app/events', event.eventId]);
      }
    } catch (err: any) {
      console.error('Error saving event:', err);
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.cancelled.emit();
    if (this.isEditMode()) {
      this.router.navigate(['/app/events']);
    } else {
      this.router.navigate(['/app/events']);
    }
  }
}
