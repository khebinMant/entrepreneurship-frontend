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
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CATALOGUE_CODES, ENTITY_TYPE } from '../../../core/constants/app.constants';
import { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import { Event as EventModel } from '../../models/event';
import { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { EntityPortal, CreateEntityPortalDto, UpdateEntityPortalDto } from '../../../entrepreneurship/models/entrepreneurship-portal';

const MAX_IMAGES = 20;

interface SocialLinkItem {
  socialPlatformId: number;
  url: string;
}

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
  private readonly toastService = inject(ToastService);

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
    mapsUrl: '',
  });

  readonly user = signal<{ userId: number } | null>(null);

  // --- Social Links ---
  readonly socialLinks = signal<SocialLinkItem[]>([]);
  readonly socialLinksLoading = signal(false);
  readonly showSocialForm = signal(false);
  readonly editingSocialIdx = signal<number | null>(null);
  readonly socialPlatforms = signal<CatalogueValue[]>([]);
  readonly savingSocialLink = signal(false);

  readonly socialForm = signal({
    socialPlatformId: null as number | null,
    url: '',
  });

  // --- Portal ---
  readonly showPortalForm = signal(false);
  readonly portal = signal<EntityPortal | null>(null);
  readonly portalLoading = signal(false);
  readonly savingPortal = signal(false);
  readonly themes = signal<CatalogueValue[]>([]);

  readonly portalForm = signal({
    subdomain: '',
    themeId: null as number | null,
    isActive: true,
    htmlContent: '',
  });

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
    this.catalogueService.getValuesByType(CATALOGUE_CODES.SOCIAL_PLATFORM).subscribe({
      next: (platforms) => this.socialPlatforms.set(platforms),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.THEME_TYPE).subscribe({
      next: (themes) => this.themes.set(themes),
    });
  }

  private afterCountriesLoaded(event: EventModel): void {
    this.populateForm(event);
    if (event.countryId) this.loadProvinces(event.countryId, event.provinceId);
    if (event.eventId) {
      this.loadExistingImages(event.eventId);
      this.loadFullEvent(event.eventId);
    }
  }

  private async loadFullEvent(eventId: number): Promise<void> {
    try {
      const full: any = await lastValueFrom(this.eventService.getById(eventId));
      console.log('[CREATE] full event:', full);
      if (full.socialLinks?.length) {
        this.socialLinks.set(full.socialLinks.map((l: any) => ({ socialPlatformId: l.socialPlatformId, url: l.url })));
      }
      console.log('[CREATE] full.portal value:', full.portal, 'truthy?', !!full.portal);
      if (full.portal) {
        const p = full.portal;
        this.portal.set(p);
        console.log('[CREATE] portal signal after set:', this.portal());
        this.portalForm.set({
          subdomain: p.subdomain || '',
          themeId: p.themeId ?? null,
          isActive: p.isActive ?? true,
          htmlContent: p.htmlContent || '',
        });
        console.log('[CREATE] portalForm after set:', this.portalForm());
      } else {
        console.log('[CREATE] portal was falsy, not overwriting portal signal');
      }
      if (full.socialPlatforms?.length) {
        this.socialPlatforms.set(full.socialPlatforms);
      }
      if (full.themes?.length) {
        this.themes.set(full.themes);
      }
    } catch (e: any) {
      console.log('[CREATE] loadFullEvent error:', e?.message || e);
    }
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
      mapsUrl: event.mapsUrl || '',
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

  // ========== Social Links ==========

  private async loadSocialLinks(eventId: number): Promise<void> {
    this.socialLinksLoading.set(true);
    try {
      const links: any[] = await lastValueFrom(this.eventService.getSocialLinks(eventId));
      console.log('[CREATE] loadSocialLinks raw:', links);
      this.socialLinks.set(links.map(l => ({ socialPlatformId: l.socialPlatformId, url: l.url })));
    } catch (e: any) {
      console.log('[CREATE] loadSocialLinks error:', e?.message || e);
    }
    finally { this.socialLinksLoading.set(false); }
  }

  openAddSocial(): void {
    this.editingSocialIdx.set(null);
    this.socialForm.set({ socialPlatformId: null, url: '' });
    this.showSocialForm.set(true);
  }

  openEditSocial(idx: number): void {
    this.editingSocialIdx.set(idx);
    const link = this.socialLinks()[idx];
    this.socialForm.set({ socialPlatformId: link.socialPlatformId, url: link.url });
    this.showSocialForm.set(true);
  }

  cancelSocialForm(): void {
    this.showSocialForm.set(false);
    this.editingSocialIdx.set(null);
  }

  getPlatformName(platformId: number): string {
    return this.socialPlatforms().find(p => p.catalogueValueId === platformId)?.name || 'Red social';
  }

  saveSocialLink(): void {
    const sf = this.socialForm();
    if (!sf.socialPlatformId || !sf.url.trim()) return;
    const link: SocialLinkItem = { socialPlatformId: sf.socialPlatformId, url: sf.url.trim() };
    this.socialLinks.update(list => {
      const next = [...list];
      const idx = this.editingSocialIdx();
      if (idx !== null && idx < next.length) next[idx] = link;
      else next.push(link);
      return next;
    });
    this.cancelSocialForm();
  }

  removeSocialLink(idx: number): void {
    this.socialLinks.update(list => list.filter((_, i) => i !== idx));
  }

  // ========== Portal ==========

  private async loadPortal(eventId: number): Promise<void> {
    this.portalLoading.set(true);
    try {
      const portal = await lastValueFrom(this.eventService.getPortal(eventId));
      if (portal) {
        this.portal.set(portal);
        this.portalForm.set({
          subdomain: portal.subdomain || '',
          themeId: portal.themeId ?? null,
          isActive: portal.isActive ?? true,
          htmlContent: portal.htmlContent || '',
        });
      }
    } catch { /* fallback */ }
    finally { this.portalLoading.set(false); }
  }

  togglePortalForm(): void {
    this.showPortalForm.update(v => !v);
  }

  async savePortal(): Promise<void> {
    const pf = this.portalForm();
    const subdomain = pf.subdomain.trim();
    if (!subdomain) {
      this.toastService.error('Escribe un subdominio para el portal (ej. mi-evento).');
      return;
    }
    this.savingPortal.set(true);
    try {
      const existing = this.portal();
      const eventId = this.editingEvent()?.eventId;
      if (eventId && existing) {
        const dto: UpdateEntityPortalDto = {
          subdomain,
          themeId: pf.themeId ?? undefined,
          isActive: pf.isActive,
          htmlContent: pf.htmlContent || undefined,
        };
        const id = (existing as any).entityPortalId ?? (existing as any).portalId ?? existing.entityId;
        await lastValueFrom(this.eventService.updatePortal(id, dto));
        this.toastService.success('Portal guardado correctamente.');
      } else if (eventId) {
        const dto: CreateEntityPortalDto = {
          entityId: eventId,
          subdomain,
          themeId: pf.themeId ?? undefined,
          isActive: pf.isActive,
          htmlContent: pf.htmlContent || undefined,
        };
        await lastValueFrom(this.eventService.createPortal(dto));
        this.toastService.success('Portal creado correctamente.');
      }
      this.showPortalForm.set(false);
    } catch {
      this.toastService.error('No se pudo guardar el portal. Revisa los datos e intenta de nuevo.');
    }
    finally { this.savingPortal.set(false); }
  }

  async deletePortal(): Promise<void> {
    const existing = this.portal();
    if (!existing) return;
    this.savingPortal.set(true);
    try {
      const id = (existing as any).entityPortalId ?? (existing as any).portalId ?? existing.entityId;
      await lastValueFrom(this.eventService.deletePortal(id));
      this.portal.set(null);
      this.portalForm.set({ subdomain: '', themeId: null, isActive: true, htmlContent: '' });
      this.showPortalForm.set(false);
      this.toastService.success('Portal eliminado correctamente.');
    } catch {
      this.toastService.error('No se pudo eliminar el portal.');
    }
    finally { this.savingPortal.set(false); }
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
        const updatePayload: any = {
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
          mapsUrl: f.mapsUrl || undefined,
        };

        const updateSocials = this.socialLinks().map(l => ({
          socialPlatformId: l.socialPlatformId,
          url: l.url,
        }));
        if (updateSocials.length) updatePayload.socialLinks = updateSocials;

        const pf = this.portalForm();
        const upSubdomain = pf.subdomain.trim();
        const upHtml = pf.htmlContent.trim();
        if (upSubdomain || upHtml || pf.themeId) {
          updatePayload.portal = {
            subdomain: upSubdomain || undefined,
            themeId: pf.themeId ?? undefined,
            isActive: pf.isActive,
            htmlContent: upHtml || undefined,
          };
        }

        await lastValueFrom(this.eventService.update(event.eventId, updatePayload));

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
        this.toastService.success(`Evento "${f.name}" actualizado correctamente.`);
      } else {
        const createPayload: any = {
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
          mapsUrl: f.mapsUrl || undefined,
        };

        const createSocials = this.socialLinks().map(l => ({
          socialPlatformId: l.socialPlatformId,
          url: l.url,
        }));
        if (createSocials.length) createPayload.socialLinks = createSocials;

        const cpf = this.portalForm();
        const cSubdomain = cpf.subdomain.trim();
        const cHtml = cpf.htmlContent.trim();
        if (cSubdomain || cHtml || cpf.themeId) {
          createPayload.portal = {
            subdomain: cSubdomain || undefined,
            themeId: cpf.themeId ?? undefined,
            isActive: cpf.isActive,
            htmlContent: cHtml || undefined,
          };
        }

        const event = await lastValueFrom(this.eventService.create(createPayload));

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
        this.toastService.success(`Evento "${f.name}" creado correctamente.`);
      }
    } catch (err: any) {
      console.error('Error saving event:', err);
      this.toastService.error('No se pudo guardar el evento. Intenta de nuevo.');
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
