import { Component, inject, input, OnInit, output, signal, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { UserService } from '../../../user/services/user.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ENTITY_TYPE, CATALOGUE_CODES } from '../../../core/constants/app.constants';
import { Category } from '../../models/category';
import { Entrepreneurship } from '../../models/entrepreneurship';
import { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import type { EntityPortal, CreateEntityPortalDto, UpdateEntityPortalDto } from '../../models/entrepreneurship-portal';
import { PortalEditorComponent, PortalFormValue } from '../../../shared/ui/portal-editor/portal-editor.component';

const MAX_IMAGES = 20;

interface LocationForm {
  countryId: number | null;
  provinceId: number | null;
  cityId: number | null;
  parishId: number | null;
  addressLine: string;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string;
}

interface SocialLinkForm {
  socialPlatformId: number | null;
  url: string;
}

@Component({
  selector: 'app-entrepreneurship-create',
  standalone: true,
  imports: [NgIf, FormsModule, PortalEditorComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  private readonly imageService = inject(ImageService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly authService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly created = output<void>();
  readonly cancelled = output<void>();
  readonly editingEntrepreneurship = input<Entrepreneurship | null>(null);

  readonly isEditMode = computed(() => !!this.editingEntrepreneurship());

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly logoFile = signal<File | null>(null);
  readonly logoPreview = signal<string | null>(null);
  readonly touched = signal<Record<string, boolean>>({});
  readonly existingImages = signal<ImageGallery[]>([]);
  readonly imagesLoading = signal(false);
  readonly uploadingImage = signal(false);

  form = signal({
    name: '',
    description: '',
    categoryId: null as number | null,
    isPhysical: false,
    isDigital: false,
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
      categoryId: show('categoryId') && !f.categoryId ? 'La categoría es obligatoria' : '',
      logo: show('logo') && !this.isEditMode() && !this.logoFile() ? 'El logo es obligatorio' : '',
    };
  });

  readonly isValid = computed(() => {
    const f = this.form();
    const base = !!(f.name && f.name.length <= 150 && f.description && f.categoryId);
    if (this.isEditMode()) return base;
    return base && !!this.logoFile();
  });

  readonly maxImages = MAX_IMAGES;
  readonly canAddMoreImages = computed(() => this.existingImages().length < MAX_IMAGES);

  // --- Locations ---
  readonly locations = signal<LocationForm[]>([]);
  readonly showLocationForm = signal(false);
  readonly editingLocationIdx = signal<number | null>(null);
  readonly locationCountries = signal<CatalogueValue[]>([]);
  readonly locationProvinces = signal<CatalogueValue[]>([]);
  readonly locationCities = signal<CatalogueValue[]>([]);
  readonly locationParishes = signal<CatalogueValue[]>([]);
  readonly loadingProvinces = signal(false);
  readonly loadingCities = signal(false);
  readonly loadingParishes = signal(false);

  readonly locationForm = signal<LocationForm>({
    countryId: null,
    provinceId: null,
    cityId: null,
    parishId: null,
    addressLine: '',
    latitude: null,
    longitude: null,
    mapsUrl: '',
  });

  // --- Social Links ---
  readonly socialLinks = signal<SocialLinkForm[]>([]);
  readonly showSocialForm = signal(false);
  readonly editingSocialIdx = signal<number | null>(null);
  readonly socialPlatforms = signal<CatalogueValue[]>([]);

  readonly socialForm = signal<SocialLinkForm>({
    socialPlatformId: null,
    url: '',
  });

  // --- Portal ---
  readonly portalForm = signal({
    subdomain: '',
    themeId: null as number | null,
    isActive: true,
    htmlContent: '',
  });
  readonly portal = signal<EntityPortal | null>(null);
  readonly portalLoading = signal(false);
  readonly savingPortal = signal(false);
  readonly themes = signal<CatalogueValue[]>([]);
  readonly showPortalSection = signal(false);

  ngOnInit(): void {
    this.loadCategories();
    this.loadUser();
    this.loadCatalogues();
    const editing = this.editingEntrepreneurship();
    if (editing) {
      this.populateForm(editing);
      this.loadExistingImages(editing.entrepreneurshipId);
      this.loadPortal(editing.entrepreneurshipId);
    }
  }

  private populateForm(e: Entrepreneurship): void {
    this.form.set({
      name: e.name || '',
      description: e.description || '',
      categoryId: e.categoryId || null,
      isPhysical: e.isPhysical,
      isDigital: e.isDigital,
    });
  }

  loadCategories(): void {
    this.entrepreneurshipService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
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

  private loadCatalogues(): void {
    this.catalogueService.getValuesByType(CATALOGUE_CODES.COUNTRY).subscribe({
      next: (countries) => this.locationCountries.set(countries),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.SOCIAL_PLATFORM).subscribe({
      next: (platforms) => this.socialPlatforms.set(platforms),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.THEME_TYPE).subscribe({
      next: (themes) => this.themes.set(themes),
    });
  }

  private loadExistingImages(entrepreneurshipId: number): void {
    this.imagesLoading.set(true);
    this.imageService.list('ENTREPRENEURSHIP', entrepreneurshipId).subscribe({
      next: (images) => {
        this.existingImages.set(images);
        this.imagesLoading.set(false);
      },
      error: () => this.imagesLoading.set(false),
    });
  }

  markTouched(field: string): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  onLogoSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.logoFile.set(file);
      this.markTouched('logo');
      const reader = new FileReader();
      reader.onload = () => this.logoPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoFile.set(null);
    this.logoPreview.set(null);
  }

  onGalleryImageSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadGalleryImage(file);
    input.value = '';
  }

  private async uploadGalleryImage(file: File): Promise<void> {
    const entrepreneurshipId = this.editingEntrepreneurship()?.entrepreneurshipId;
    if (!entrepreneurshipId) return;
    this.uploadingImage.set(true);
    try {
      await lastValueFrom(this.imageService.upload(
        file,
        'ENTREPRENEURSHIP',
        entrepreneurshipId,
        this.existingImages().length + 1,
        file.name,
        this.user()?.userId,
      ));
      this.loadExistingImages(entrepreneurshipId);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      this.uploadingImage.set(false);
    }
  }

  deleteImage(imageId: number): void {
    const entrepreneurshipId = this.editingEntrepreneurship()?.entrepreneurshipId;
    if (!entrepreneurshipId) return;
    this.imageService.delete(imageId, 'ENTREPRENEURSHIP', entrepreneurshipId).subscribe({
      next: () => this.loadExistingImages(entrepreneurshipId),
      error: (err) => console.error('Error deleting image:', err),
    });
  }

  // ===================== Locations =====================

  openAddLocation(): void {
    this.editingLocationIdx.set(null);
    this.locationForm.set({ countryId: null, provinceId: null, cityId: null, parishId: null, addressLine: '', latitude: null, longitude: null, mapsUrl: '' });
    this.locationProvinces.set([]);
    this.locationCities.set([]);
    this.locationParishes.set([]);
    this.showLocationForm.set(true);
  }

  openEditLocation(idx: number): void {
    this.editingLocationIdx.set(idx);
    const loc = this.locations()[idx];
    this.locationForm.set({ ...loc, mapsUrl: loc.mapsUrl ?? '' });
    this.locationProvinces.set([]);
    this.locationCities.set([]);
    this.locationParishes.set([]);
    if (loc.countryId) this.loadLocationProvinces(loc.countryId);
    if (loc.provinceId) this.loadLocationCities(loc.provinceId);
    if (loc.cityId) this.loadLocationParishes(loc.cityId);
    this.showLocationForm.set(true);
  }

  cancelLocationForm(): void {
    this.showLocationForm.set(false);
    this.editingLocationIdx.set(null);
    this.locationError.set(null);
  }

  onLocationCountryChange(): void {
    this.locationForm.update(f => ({ ...f, provinceId: null, cityId: null, parishId: null }));
    this.locationCities.set([]);
    this.locationParishes.set([]);
    const countryId = this.locationForm().countryId;
    if (countryId) this.loadLocationProvinces(countryId);
    else this.locationProvinces.set([]);
  }

  onLocationProvinceChange(): void {
    this.locationForm.update(f => ({ ...f, cityId: null, parishId: null }));
    this.locationParishes.set([]);
    const provinceId = this.locationForm().provinceId;
    if (provinceId) this.loadLocationCities(provinceId);
    else this.locationCities.set([]);
  }

  onLocationCityChange(): void {
    this.locationForm.update(f => ({ ...f, parishId: null }));
    const cityId = this.locationForm().cityId;
    if (cityId) this.loadLocationParishes(cityId);
    else this.locationParishes.set([]);
  }

  private loadLocationProvinces(countryId: number): void {
    this.loadingProvinces.set(true);
    this.catalogueService.getValueChildren(countryId).subscribe({
      next: (provinces) => { this.locationProvinces.set(provinces); this.loadingProvinces.set(false); },
      error: () => this.loadingProvinces.set(false),
    });
  }

  private loadLocationCities(provinceId: number): void {
    this.loadingCities.set(true);
    this.catalogueService.getValueChildren(provinceId).subscribe({
      next: (cities) => { this.locationCities.set(cities); this.loadingCities.set(false); },
      error: () => this.loadingCities.set(false),
    });
  }

  private loadLocationParishes(cityId: number): void {
    this.loadingParishes.set(true);
    this.catalogueService.getValueChildren(cityId).subscribe({
      next: (parishes) => { this.locationParishes.set(parishes); this.loadingParishes.set(false); },
      error: () => this.loadingParishes.set(false),
    });
  }

  readonly locationError = signal<string | null>(null);

  saveLocation(): void {
    const f = this.locationForm();
    if (!f.countryId || !f.provinceId || !f.cityId || !f.addressLine.trim()) return;
    this.locationError.set(null);
    if (f.latitude != null && (f.latitude < -90 || f.latitude > 90)) {
      this.locationError.set('Latitud debe estar entre -90 y 90');
      return;
    }
    if (f.longitude != null && (f.longitude < -180 || f.longitude > 180)) {
      this.locationError.set('Longitud debe estar entre -180 y 180');
      return;
    }
    const loc: LocationForm = {
      countryId: f.countryId,
      provinceId: f.provinceId,
      cityId: f.cityId,
      parishId: f.parishId,
      addressLine: f.addressLine.trim(),
      latitude: f.latitude,
      longitude: f.longitude,
      mapsUrl: f.mapsUrl || '',
    };
    this.locations.update(list => {
      const next = [...list];
      const idx = this.editingLocationIdx();
      if (idx !== null && idx < next.length) next[idx] = loc;
      else next.push(loc);
      return next;
    });
    this.cancelLocationForm();
  }

  removeLocation(idx: number): void {
    this.locations.update(list => list.filter((_, i) => i !== idx));
  }

  // ===================== Social Links =====================

  openAddSocial(): void {
    this.editingSocialIdx.set(null);
    this.socialForm.set({ socialPlatformId: null, url: '' });
    this.showSocialForm.set(true);
  }

  openEditSocial(idx: number): void {
    this.editingSocialIdx.set(idx);
    this.socialForm.set({ ...this.socialLinks()[idx] });
    this.showSocialForm.set(true);
  }

  cancelSocialForm(): void {
    this.showSocialForm.set(false);
    this.editingSocialIdx.set(null);
  }

  saveSocialLink(): void {
    const f = this.socialForm();
    if (!f.socialPlatformId || !f.url.trim()) return;
    const link = { socialPlatformId: f.socialPlatformId, url: f.url.trim() };
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

  getPlatformName(platformId: number | null): string {
    if (!platformId) return '';
    return this.socialPlatforms().find(p => p.catalogueValueId === platformId)?.name ?? '';
  }

  getCatalogueName(id: number | null, list: CatalogueValue[]): string {
    if (!id) return '';
    return list.find(v => v.catalogueValueId === id)?.name ?? '';
  }

  // ===================== Submit =====================

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    const allFields = this.isEditMode()
      ? ['name', 'description', 'categoryId']
      : ['name', 'description', 'categoryId', 'logo'];
    this.touched.update(t => {
      const updated = { ...t };
      for (const field of allFields) updated[field] = true;
      return updated;
    });
    if (!this.isValid()) return;

    this.loading.set(true);
    const f = this.form();
    const currentUser = this.user();
    const portal = this.portalForm();
    try {
      if (this.isEditMode()) {
        const entrepreneurship = this.editingEntrepreneurship()!;
        const updatePayload: any = {
          userId: currentUser!.userId,
          name: f.name,
          description: f.description,
          categoryId: f.categoryId!,
          isPhysical: f.isPhysical,
          isDigital: f.isDigital,
        };

        const updateSocials = this.socialLinks().map(l => ({
          socialPlatformId: l.socialPlatformId!,
          url: l.url,
        }));
        if (updateSocials.length) updatePayload.socialLinks = updateSocials;

        const updateLocs = this.locations().map(l => ({
          countryId: l.countryId!,
          provinceId: l.provinceId!,
          cityId: l.cityId!,
          parishId: l.parishId ?? undefined,
          addressLine: l.addressLine,
          latitude: l.latitude ?? undefined,
          longitude: l.longitude ?? undefined,
          mapsUrl: l.mapsUrl || undefined,
        }));
        if (updateLocs.length) updatePayload.locations = updateLocs;

        const updateSubdomain = portal.subdomain.trim();
        const updateHtmlContent = portal.htmlContent.trim();
        if (updateSubdomain || updateHtmlContent || portal.themeId) {
          updatePayload.portal = {
            subdomain: updateSubdomain || undefined,
            themeId: portal.themeId ?? undefined,
            isActive: portal.isActive,
            htmlContent: updateHtmlContent || undefined,
          };
        }

        await lastValueFrom(this.entrepreneurshipService.update(entrepreneurship.entrepreneurshipId, updatePayload));

        if (this.logoFile()) {
          await lastValueFrom(this.imageService.upload(
            this.logoFile()!,
            ENTITY_TYPE.ENTREPRENEURSHIP,
            entrepreneurship.entrepreneurshipId,
            0,
            'Logo de ' + entrepreneurship.name,
            currentUser?.userId,
          ));
        }

        this.created.emit();
        this.router.navigate(['/app/entrepreneurships', entrepreneurship.entrepreneurshipId]);
        this.toastService.success(`Emprendimiento "${f.name}" actualizado correctamente.`);
      } else {
        const payload: any = {
          userId: currentUser?.userId ?? 0,
          categoryId: f.categoryId!,
          name: f.name,
          description: f.description,
          isPhysical: f.isPhysical,
          isDigital: f.isDigital,
        };

        const socials = this.socialLinks().map(l => ({
          socialPlatformId: l.socialPlatformId!,
          url: l.url,
        }));
        if (socials.length) payload.socialLinks = socials;

        const locs = this.locations().map(l => ({
          countryId: l.countryId!,
          provinceId: l.provinceId!,
          cityId: l.cityId!,
          parishId: l.parishId ?? undefined,
          addressLine: l.addressLine,
          latitude: l.latitude ?? undefined,
          longitude: l.longitude ?? undefined,
          mapsUrl: l.mapsUrl || undefined,
        }));
        if (locs.length) payload.locations = locs;

        const subdomain = portal.subdomain.trim();
        const htmlContent = portal.htmlContent.trim();
        if (subdomain || htmlContent || portal.themeId) {
          payload.portal = {
            subdomain: subdomain || undefined,
            themeId: portal.themeId ?? undefined,
            isActive: portal.isActive,
            htmlContent: htmlContent || undefined,
          };
        }

        const entrepreneurship = await lastValueFrom(this.entrepreneurshipService.create(payload));

        if (this.logoFile()) {
          await lastValueFrom(this.imageService.upload(
            this.logoFile()!,
            ENTITY_TYPE.ENTREPRENEURSHIP,
            entrepreneurship.entrepreneurshipId,
            0,
            'Logo de ' + entrepreneurship.name,
            currentUser?.userId,
          ));
        }

        this.created.emit();
        this.router.navigate(['/app/entrepreneurships', entrepreneurship.entrepreneurshipId]);
        this.toastService.success(`Emprendimiento "${f.name}" creado correctamente.`);
      }
    } catch (err: any) {
      console.error('Error saving entrepreneurship:', err);
      this.toastService.error('No se pudo guardar el emprendimiento. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.cancelled.emit();
    this.router.navigate(['/app/entrepreneurships']);
  }

  // ========== Portal ==========

  private async loadPortal(entrepreneurshipId: number): Promise<void> {
    this.portalLoading.set(true);
    try {
      const [portal, themes] = await Promise.all([
        lastValueFrom(this.entrepreneurshipService.getPortal(entrepreneurshipId)),
        lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.THEME_TYPE)),
      ]);
      if (portal) {
        this.portal.set(portal);
        this.portalForm.set({
          subdomain: portal.subdomain || '',
          themeId: portal.themeId ?? null,
          isActive: portal.isActive ?? true,
          htmlContent: portal.htmlContent || '',
        });
      }
      if (themes.length) this.themes.set(themes);
    } catch { /* fallback */ }
    finally { this.portalLoading.set(false); }
  }

  async onPortalSave(f: PortalFormValue): Promise<void> {
    const subdomain = f.subdomain.trim();
    if (!subdomain) {
      this.toastService.error('Escribe un subdominio para el portal (ej. mi-emprendimiento).');
      return;
    }
    this.savingPortal.set(true);
    try {
      const existing = this.portal();
      const entrepreneurshipId = this.editingEntrepreneurship()?.entrepreneurshipId;
      if (entrepreneurshipId && existing) {
        const dto: UpdateEntityPortalDto = {
          subdomain,
          themeId: f.themeId ?? undefined,
          isActive: f.isActive,
          htmlContent: f.htmlContent || undefined,
        };
        const id = (existing as any).entityPortalId ?? (existing as any).portalId ?? existing.entityId;
        await lastValueFrom(this.entrepreneurshipService.updatePortal(id, dto));
        this.toastService.success('Portal guardado correctamente.');
      } else if (entrepreneurshipId) {
        const dto: CreateEntityPortalDto = {
          entityId: entrepreneurshipId,
          subdomain,
          themeId: f.themeId ?? undefined,
          isActive: f.isActive,
          htmlContent: f.htmlContent || undefined,
        };
        await lastValueFrom(this.entrepreneurshipService.createPortal(dto));
        this.toastService.success('Portal creado correctamente.');
      }
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
      await lastValueFrom(this.entrepreneurshipService.deletePortal(id));
      this.portal.set(null);
      this.portalForm.set({ subdomain: '', themeId: null, isActive: true, htmlContent: '' });
      this.toastService.success('Portal eliminado correctamente.');
    } catch {
      this.toastService.error('No se pudo eliminar el portal.');
    }
    finally { this.savingPortal.set(false); }
  }
}
