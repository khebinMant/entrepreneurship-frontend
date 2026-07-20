import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { CATALOGUE_CODES } from '../../../core/constants/app.constants';
import type { Category } from '../../models/category';
import type { Entrepreneurship } from '../../models/entrepreneurship';
import type { EntrepreneurshipLocation } from '../../models/entrepreneurship-location';
import type { EntitySocialLink } from '../../models/entrepreneurship-social-link';
import type { EntityPortal } from '../../models/entrepreneurship-portal';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';

const MAX_IMAGES = 20;

type TabId = 'info' | 'locations' | 'socials' | 'portal';
interface Tab { id: TabId; label: string; }

interface LocationFormValue {
  countryId: number | null;
  provinceId: number | null;
  cityId: number | null;
  parishId: number | null;
  addressLine: string;
  latitude: number | null;
  longitude: number | null;
}

interface SocialFormValue {
  socialPlatformId: number | null;
  url: string;
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  private readonly imageService = inject(ImageService);
  private readonly catalogueService = inject(CatalogueService);

  readonly editingEntrepreneurship = input<Entrepreneurship | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly activeTab = signal<TabId>('info');

  readonly tabs: Tab[] = [
    { id: 'info', label: 'Información' },
    { id: 'locations', label: 'Direcciones' },
    { id: 'socials', label: 'Redes Sociales' },
    { id: 'portal', label: 'Portal' },
  ];

  readonly entrepreneurship = signal<Entrepreneurship | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  form = signal({
    name: '',
    description: '',
    categoryId: null as number | null,
    isPhysical: false,
    isDigital: false,
  });

  readonly logoFile = signal<File | null>(null);
  readonly logoPreview = signal<string | null>(null);
  readonly existingImages = signal<ImageGallery[]>([]);
  readonly imagesLoading = signal(false);
  readonly uploadingImage = signal(false);
  readonly maxImages = MAX_IMAGES;
  readonly canAddMoreImages = computed(() => this.existingImages().length < MAX_IMAGES);

  readonly logoImage = computed(() => {
    const imgs = this.existingImages();
    return imgs.length > 0 ? imgs[0] : null;
  });

  private entrepreneurshipId: number | null = null;
  private readonly isModal = computed(() => !!this.editingEntrepreneurship());

  // --- Locations ---
  readonly locations = signal<EntrepreneurshipLocation[]>([]);
  readonly locationsLoading = signal(false);
  readonly showLocationForm = signal(false);
  readonly editingLocation = signal<EntrepreneurshipLocation | null>(null);

  readonly locationCountries = signal<CatalogueValue[]>([]);
  readonly locationProvinces = signal<CatalogueValue[]>([]);
  readonly locationCities = signal<CatalogueValue[]>([]);
  readonly locationParishes = signal<CatalogueValue[]>([]);
  readonly loadingProvinces = signal(false);
  readonly loadingCities = signal(false);
  readonly loadingParishes = signal(false);
  readonly savingLocation = signal(false);
  readonly locationError = signal<string | null>(null);

  readonly locationForm = signal<LocationFormValue>({
    countryId: null, provinceId: null, cityId: null, parishId: null,
    addressLine: '', latitude: null, longitude: null,
  });

  // --- Social Links ---
  readonly socialLinks = signal<EntitySocialLink[]>([]);
  readonly socialLinksLoading = signal(false);
  readonly showSocialForm = signal(false);
  readonly editingSocialLink = signal<EntitySocialLink | null>(null);
  readonly socialPlatforms = signal<CatalogueValue[]>([]);
  readonly savingSocialLink = signal(false);

  readonly socialForm = signal<SocialFormValue>({
    socialPlatformId: null, url: '',
  });

  // --- Portal ---
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

  ngOnInit(): void {
    const input = this.editingEntrepreneurship();
    if (input) {
      this.entrepreneurshipId = input.entrepreneurshipId;
      this.entrepreneurship.set(input);
      this.populateForm(input);
      this.loadCatalogues();
      this.loadExistingImages();
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!id) {
        this.router.navigate(['/app/entrepreneurships']);
        return;
      }
      this.entrepreneurshipId = id;
      this.loadEntrepreneurship();
    }
    this.loadCategories();
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  private loadExistingImages(): void {
    const id = this.entrepreneurshipId!;
    this.imagesLoading.set(true);
    this.imageService.list('ENTREPRENEURSHIP', id).subscribe({
      next: (images) => { this.existingImages.set(images); this.imagesLoading.set(false); },
      error: () => this.imagesLoading.set(false),
    });
  }

  private loadEntrepreneurship(): void {
    const id = this.entrepreneurshipId!;
    this.loading.set(true);
    this.entrepreneurshipService.getById(id).subscribe({
      next: (e) => {
        this.entrepreneurship.set(e);
        this.populateForm(e);
        this.loadCatalogues();
        this.loadExistingImages();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/app/entrepreneurships']);
      },
    });
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

  private loadCategories(): void {
    this.entrepreneurshipService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
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

  loadLocations(): void {
    const id = this.entrepreneurshipId!;
    this.locationsLoading.set(true);
    this.entrepreneurshipService.getLocations(id).subscribe({
      next: (locs) => { this.locations.set(locs); this.locationsLoading.set(false); },
      error: () => this.locationsLoading.set(false),
    });
  }

  loadSocialLinks(): void {
    const id = this.entrepreneurshipId!;
    this.socialLinksLoading.set(true);
    this.entrepreneurshipService.getSocialLinks(id).subscribe({
      next: (links) => { this.socialLinks.set(links); this.socialLinksLoading.set(false); },
      error: () => this.socialLinksLoading.set(false),
    });
  }

  loadPortal(): void {
    const id = this.entrepreneurshipId!;
    this.portalLoading.set(true);
    this.entrepreneurshipService.getPortal(id).subscribe({
      next: (res: any) => {
        const p = Array.isArray(res) ? res[0] : res;
        if (!p) { this.portalLoading.set(false); return; }
        this.portal.set(p);
        this.portalForm.set({
          subdomain: p.subdomain ?? '',
          themeId: p.themeId ?? null,
          isActive: p.isActive ?? true,
          htmlContent: p.htmlContent ?? '',
        });
        this.portalLoading.set(false);
      },
      error: () => this.portalLoading.set(false),
    });
  }

  onTabChange(tab: TabId): void {
    this.activeTab.set(tab);
    if (tab === 'locations' && this.locations().length === 0 && !this.locationsLoading()) {
      this.loadLocations();
    } else if (tab === 'socials' && this.socialLinks().length === 0 && !this.socialLinksLoading()) {
      this.loadSocialLinks();
    } else if (tab === 'portal' && this.portal() === null && !this.portalLoading()) {
      this.loadPortal();
    }
  }

  // ===================== Logo =====================

  onLogoSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.logoFile.set(file);
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
    const id = this.entrepreneurshipId!;
    this.uploadingImage.set(true);
    try {
      await lastValueFrom(this.imageService.upload(
        file,
        'ENTREPRENEURSHIP',
        id,
        this.existingImages().length + 1,
        file.name,
        this.entrepreneurship()!.userId,
      ));
      this.loadExistingImages();
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      this.uploadingImage.set(false);
    }
  }

  deleteImage(imageId: number): void {
    const id = this.entrepreneurshipId!;
    this.imageService.delete(imageId, 'ENTREPRENEURSHIP', id).subscribe({
      next: () => this.loadExistingImages(),
      error: (err) => console.error('Error deleting image:', err),
    });
  }

  // ===================== Save info =====================

  async saveInfo(): Promise<void> {
    const id = this.entrepreneurshipId!;
    const f = this.form();
    this.saving.set(true);
    try {
      await lastValueFrom(this.entrepreneurshipService.update(id, {
        userId: this.entrepreneurship()!.userId,
        name: f.name,
        description: f.description,
        categoryId: f.categoryId!,
        isPhysical: f.isPhysical,
        isDigital: f.isDigital,
      }));

      if (this.logoFile()) {
        await lastValueFrom(this.imageService.upload(
          this.logoFile()!,
          'ENTREPRENEURSHIP',
          id,
          0,
          'Logo de ' + f.name,
          this.entrepreneurship()!.userId,
        ));
      }

      this.saved.emit();
      this.goBack();
    } catch (err: any) {
      console.error('Error saving entrepreneurship:', err);
    } finally {
      this.saving.set(false);
    }
  }

  // ===================== Locations =====================

  openAddLocation(): void {
    this.editingLocation.set(null);
    this.locationForm.set({ countryId: null, provinceId: null, cityId: null, parishId: null, addressLine: '', latitude: null, longitude: null });
    this.locationProvinces.set([]);
    this.locationCities.set([]);
    this.locationParishes.set([]);
    this.showLocationForm.set(true);
  }

  openEditLocation(loc: EntrepreneurshipLocation): void {
    this.editingLocation.set(loc);
    this.locationForm.set({
      countryId: loc.countryId,
      provinceId: loc.provinceId,
      cityId: loc.cityId,
      parishId: loc.parishId ?? null,
      addressLine: loc.addressLine,
      latitude: loc.latitude ?? null,
      longitude: loc.longitude ?? null,
    });
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
    this.editingLocation.set(null);
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

  async saveLocation(): Promise<void> {
    const f = this.locationForm();
    if (!f.countryId || !f.provinceId || !f.cityId || !f.addressLine.trim()) return;
    this.locationError.set(null);
    const lat = f.latitude;
    const lon = f.longitude;
    if (lat != null && (lat < -90 || lat > 90)) {
      this.locationError.set('Latitud debe estar entre -90 y 90');
      return;
    }
    if (lon != null && (lon < -180 || lon > 180)) {
      this.locationError.set('Longitud debe estar entre -180 y 180');
      return;
    }
    this.savingLocation.set(true);
    const editing = this.editingLocation();
    const dto = {
      entrepreneurshipId: this.entrepreneurshipId!,
      countryId: f.countryId,
      provinceId: f.provinceId,
      cityId: f.cityId,
      parishId: f.parishId ?? undefined,
      addressLine: f.addressLine.trim(),
      latitude: lat ?? undefined,
      longitude: lon ?? undefined,
    };
    try {
      const obs$ = editing
        ? this.entrepreneurshipService.updateLocation(editing.entrepreneurshipLocationId, dto)
        : this.entrepreneurshipService.createLocation(dto);
      await lastValueFrom(obs$);
      this.loadLocations();
      this.cancelLocationForm();
    } catch (err) {
      console.error('Error saving location:', err);
    } finally {
      this.savingLocation.set(false);
    }
  }

  async deleteLocation(loc: EntrepreneurshipLocation): Promise<void> {
    try {
      await lastValueFrom(this.entrepreneurshipService.deleteLocation(loc.entrepreneurshipLocationId));
      this.loadLocations();
    } catch (err) {
      console.error('Error deleting location:', err);
    }
  }

  getCatalogueName(id: number | null, list: CatalogueValue[]): string {
    if (!id) return '';
    return list.find(v => v.catalogueValueId === id)?.name ?? '';
  }

  // ===================== Social Links =====================

  openAddSocial(): void {
    this.editingSocialLink.set(null);
    this.socialForm.set({ socialPlatformId: null, url: '' });
    this.showSocialForm.set(true);
  }

  openEditSocial(link: EntitySocialLink): void {
    this.editingSocialLink.set(link);
    this.socialForm.set({ socialPlatformId: link.socialPlatformId, url: link.url });
    this.showSocialForm.set(true);
  }

  cancelSocialForm(): void {
    this.showSocialForm.set(false);
    this.editingSocialLink.set(null);
  }

  async saveSocialLink(): Promise<void> {
    const f = this.socialForm();
    if (!f.socialPlatformId || !f.url.trim()) return;
    this.savingSocialLink.set(true);
    const editing = this.editingSocialLink();
    try {
      if (editing) {
        await lastValueFrom(this.entrepreneurshipService.updateSocialLink(editing.entitySocialLinkId, {
          entityId: this.entrepreneurshipId!,
          socialPlatformId: f.socialPlatformId,
          url: f.url.trim(),
        }));
      } else {
        await lastValueFrom(this.entrepreneurshipService.createSocialLink({
          entityId: this.entrepreneurshipId!,
          socialPlatformId: f.socialPlatformId,
          url: f.url.trim(),
        }));
      }
      this.loadSocialLinks();
      this.cancelSocialForm();
    } catch (err) {
      console.error('Error saving social link:', err);
    } finally {
      this.savingSocialLink.set(false);
    }
  }

  async deleteSocialLink(link: EntitySocialLink): Promise<void> {
    try {
      await lastValueFrom(this.entrepreneurshipService.deleteSocialLink(link.entitySocialLinkId));
      this.loadSocialLinks();
    } catch (err) {
      console.error('Error deleting social link:', err);
    }
  }

  getPlatformName(platformId: number | null): string {
    if (!platformId) return '';
    return this.socialPlatforms().find(p => p.catalogueValueId === platformId)?.name ?? '';
  }

  // ===================== Portal =====================

  async savePortal(): Promise<void> {
    const id = this.entrepreneurshipId!;
    const f = this.portalForm();
    const existing = this.portal();
    this.savingPortal.set(true);
    try {
      if (existing) {
        await lastValueFrom(this.entrepreneurshipService.updatePortal(existing.entityPortalId, {
          entityId: id,
          subdomain: f.subdomain.trim() || undefined,
          themeId: f.themeId ?? undefined,
          isActive: f.isActive,
          htmlContent: f.htmlContent?.trim() || undefined,
        }));
      } else {
        await lastValueFrom(this.entrepreneurshipService.createPortal({
          entityId: id,
          subdomain: f.subdomain.trim() || undefined,
          themeId: f.themeId ?? undefined,
          isActive: f.isActive,
          htmlContent: f.htmlContent?.trim() || undefined,
        }));
      }
      this.loadPortal();
    } catch (err) {
      console.error('Error saving portal:', err);
    } finally {
      this.savingPortal.set(false);
    }
  }

  async deletePortal(): Promise<void> {
    const existing = this.portal();
    const portalId = existing?.entityPortalId ?? (existing as any)?.id ?? (existing as any)?.portalId;
    if (!portalId) {
      console.error('Portal ID not found');
      return;
    }
    try {
      await lastValueFrom(this.entrepreneurshipService.deletePortal(portalId));
      this.portal.set(null);
      this.portalForm.set({ subdomain: '', themeId: null, isActive: true, htmlContent: '' });
    } catch (err) {
      console.error('Error deleting portal:', err);
    }
  }

  // ===================== Navigation =====================

  goBack(): void {
    if (this.isModal()) {
      this.cancelled.emit();
    } else {
      const id = this.entrepreneurshipId;
      if (id) this.router.navigate(['/app/entrepreneurships', id]);
      else this.router.navigate(['/app/entrepreneurships']);
    }
  }

  cancel(): void {
    this.goBack();
  }
}
