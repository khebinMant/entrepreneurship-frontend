import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EventService } from '../../services/event.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CATALOGUE_CODES, ENTITY_TYPE } from '../../../core/constants/app.constants';
import type { Event as EventModel } from '../../models/event';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { EntitySocialLink, CreateEntitySocialLinkDto, UpdateEntitySocialLinkDto } from '../../../entrepreneurship/models/entrepreneurship-social-link';
import type { EntityPortal, CreateEntityPortalDto, UpdateEntityPortalDto } from '../../../entrepreneurship/models/entrepreneurship-portal';

type TabId = 'info' | 'socials' | 'portal';
interface Tab { id: TabId; label: string; }

interface SocialFormValue {
  socialPlatformId: number | null;
  url: string;
}

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly imageService = inject(ImageService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly toastService = inject(ToastService);

  readonly activeTab = signal<TabId>('info');

  readonly tabs: Tab[] = [
    { id: 'info', label: 'Información' },
    { id: 'socials', label: 'Redes Sociales' },
    { id: 'portal', label: 'Portal' },
  ];

  readonly event = signal<EventModel | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly eventTypes = signal<CatalogueValue[]>([]);
  readonly visibilities = signal<CatalogueValue[]>([]);
  readonly countries = signal<CatalogueValue[]>([]);
  readonly provinces = signal<CatalogueValue[]>([]);
  readonly cities = signal<CatalogueValue[]>([]);

  readonly loadingProvinces = signal(false);
  readonly loadingCities = signal(false);

  readonly existingImages = signal<ImageGallery[]>([]);
  readonly imagesLoading = signal(false);
  readonly uploadingImage = signal(false);
  readonly maxImages = 20;
  readonly canAddMoreImages = computed(() => this.existingImages().length < this.maxImages);

  form = signal({
    name: '',
    description: '',
    eventTypeId: null as number | null,
    eventVisibilityId: null as number | null,
    isPaid: false,
    price: null as number | null,
    maxAttendees: null as number | null,
    maxEntrepreneurships: null as number | null,
    startDatetime: '',
    endDatetime: '',
    countryId: null as number | null,
    provinceId: null as number | null,
    cityId: null as number | null,
    addressLine: '',
    mapsUrl: '',
    virtualLink: '',
  });

  private eventId: number | null = null;

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

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/app/events']); return; }
    this.eventId = id;
    await Promise.all([
      this.loadEvent(),
      this.loadCatalogues(),
    ]);
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
    console.log('[EDIT] setTab:', tab, 'socialLinks.length:', this.socialLinks().length, 'socialLinks:', this.socialLinks(), 'portal:', this.portal());
    if (tab === 'socials' && this.socialLinks().length === 0 && !this.socialLinksLoading()) {
      console.log('[EDIT] calling loadSocialLinks');
      this.loadSocialLinks();
    } else if (tab === 'portal' && this.portal() === null && !this.portalLoading()) {
      console.log('[EDIT] calling loadPortal');
      this.loadPortal();
    }
  }

  private async loadEvent(): Promise<void> {
    this.loading.set(true);
    try {
      const result: any = await lastValueFrom(this.eventService.getById(this.eventId!));
      console.log('[EDIT] Event API result:', result);
      console.log('[EDIT] socialLinks from API:', result?.socialLinks);
      this.event.set(result);
      this.populateForm(result);

      if (result.socialLinks?.length) {
        const mapped = result.socialLinks.map((link: any) => ({
          entitySocialLinkId: link.socialLinkId ?? link.entitySocialLinkId,
          entityId: link.entityId ?? this.eventId!,
          socialPlatformId: link.socialPlatformId,
          socialPlatformName: link.socialPlatformName,
          url: link.url,
        }));
        console.log('[EDIT] mapped socialLinks:', mapped);
        this.socialLinks.set(mapped);
        console.log('[EDIT] socialLinks signal after set:', this.socialLinks());
      } else {
        console.log('[EDIT] socialLinks NOT found in API response');
      }
      if (result.socialPlatforms?.length) {
        this.socialPlatforms.set(result.socialPlatforms);
      } else {
        this.loadSocialPlatforms();
      }

      if (result.portal) {
        const p = result.portal;
        this.portal.set({ ...p, entityPortalId: p.entityPortalId ?? p.portalId });
        this.portalForm.set({
          subdomain: p.subdomain || '',
          themeId: p.themeId ?? null,
          isActive: p.isActive ?? true,
          htmlContent: p.htmlContent || '',
        });
      }
      if (result.themes?.length) {
        this.themes.set(result.themes);
      } else {
        this.loadThemes();
      }

      await this.loadExistingImages();
    } catch { /* fallback */ }
    finally { this.loading.set(false); }
  }

  private populateForm(e: EventModel): void {
    this.form.set({
      name: e.name || '',
      description: e.description || '',
      eventTypeId: e.eventTypeId ?? null,
      eventVisibilityId: e.eventVisibilityId ?? null,
      isPaid: e.isPaid ?? false,
      price: e.price ?? null,
      maxAttendees: e.maxAttendees ?? null,
      maxEntrepreneurships: e.maxEntrepreneurships ?? null,
      startDatetime: e.startDatetime ? e.startDatetime.slice(0, 16) : '',
      endDatetime: e.endDatetime ? e.endDatetime.slice(0, 16) : '',
      countryId: e.countryId ?? null,
      provinceId: e.provinceId ?? null,
      cityId: e.cityId ?? null,
      addressLine: e.addressLine || '',
      mapsUrl: e.mapsUrl || '',
      virtualLink: e.virtualLink || '',
    });
  }

  private async loadCatalogues(): Promise<void> {
    try {
      const [types, vis, countries] = await Promise.all([
        lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_TYPE)),
        lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.EVENT_VISIBILITY)),
        lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.COUNTRY)),
      ]);
      this.eventTypes.set(types);
      this.visibilities.set(vis);
      this.countries.set(countries);
    } catch { /* fallback */ }
  }

  async onCountryChange(): Promise<void> {
    this.form.update(f => ({ ...f, provinceId: null, cityId: null }));
    this.provinces.set([]); this.cities.set([]);
    const countryId = this.form().countryId;
    if (!countryId) return;
    this.loadingProvinces.set(true);
    try {
      const result = await lastValueFrom(this.catalogueService.getValueChildren(countryId));
      this.provinces.set(result);
    } catch { /* fallback */ }
    finally { this.loadingProvinces.set(false); }
  }

  async onProvinceChange(): Promise<void> {
    this.form.update(f => ({ ...f, cityId: null }));
    this.cities.set([]);
    const provinceId = this.form().provinceId;
    if (!provinceId) return;
    this.loadingCities.set(true);
    try {
      const result = await lastValueFrom(this.catalogueService.getValueChildren(provinceId));
      this.cities.set(result);
    } catch { /* fallback */ }
    finally { this.loadingCities.set(false); }
  }

  private async loadExistingImages(): Promise<void> {
    this.imagesLoading.set(true);
    try {
      const images = await lastValueFrom(this.imageService.list(ENTITY_TYPE.EVENT, this.eventId!));
      this.existingImages.set(images);
    } catch { /* fallback */ }
    finally { this.imagesLoading.set(false); }
  }

  async deleteImage(imageId: number): Promise<void> {
    try {
      await lastValueFrom(this.imageService.delete(imageId, ENTITY_TYPE.EVENT, this.eventId!));
      this.imageService.invalidateCache(ENTITY_TYPE.EVENT, this.eventId!);
      await this.loadExistingImages();
    } catch { /* fallback */ }
  }

  async onGalleryImageSelected(evt: any): Promise<void> {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file || !this.eventId) return;
    this.uploadingImage.set(true);
    try {
      await lastValueFrom(this.imageService.upload(file, ENTITY_TYPE.EVENT, this.eventId, undefined, undefined, undefined));
      this.imageService.invalidateCache(ENTITY_TYPE.EVENT, this.eventId);
      await this.loadExistingImages();
      this.toastService.success('Imagen de la galería subida correctamente.');
    } catch { /* fallback */ }
    finally { this.uploadingImage.set(false); (evt.target as HTMLInputElement).value = ''; }
  }

  async saveInfo(): Promise<void> {
    const f = this.form();
    if (!f.name.trim() || !f.description.trim() || !f.eventTypeId || !f.eventVisibilityId || !f.startDatetime || !f.endDatetime) return;
    this.saving.set(true);
    try {
      const payload: any = {
        name: f.name.trim(),
        description: f.description.trim(),
        eventTypeId: f.eventTypeId,
        eventVisibilityId: f.eventVisibilityId,
        isPaid: f.isPaid,
        price: f.isPaid ? f.price ?? undefined : undefined,
        startDatetime: f.startDatetime,
        endDatetime: f.endDatetime,
        countryId: f.countryId!,
        provinceId: f.provinceId!,
        cityId: f.cityId!,
        addressLine: f.addressLine,
        mapsUrl: f.mapsUrl || undefined,
        maxAttendees: f.maxAttendees ?? undefined,
        maxEntrepreneurships: f.maxEntrepreneurships ?? undefined,
      };

      const socials = this.socialLinks().map(l => ({
        socialPlatformId: l.socialPlatformId,
        url: l.url,
      }));
      if (socials.length) payload.socialLinks = socials;

      const pf = this.portalForm();
      const subdomain = pf.subdomain.trim();
      const htmlContent = pf.htmlContent.trim();
      if (subdomain || htmlContent || pf.themeId) {
        payload.portal = {
          subdomain: subdomain || undefined,
          themeId: pf.themeId ?? undefined,
          isActive: pf.isActive,
          htmlContent: htmlContent || undefined,
        };
      }

      await lastValueFrom(this.eventService.update(this.eventId!, payload));
      await this.loadEvent();
      this.toastService.success('Evento actualizado correctamente.');
    } catch {
      this.toastService.error('No se pudo guardar el evento. Intenta de nuevo.');
    }
    finally { this.saving.set(false); }
  }

  cancel(): void {
    this.router.navigate(['/app/events', this.eventId]);
  }

  // ========== Social Links ==========

  private async loadSocialPlatforms(): Promise<void> {
    try {
      const platforms = await lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.SOCIAL_PLATFORM));
      this.socialPlatforms.set(platforms);
    } catch { /* fallback */ }
  }

  private async loadSocialLinks(): Promise<void> {
    this.socialLinksLoading.set(true);
    try {
      const [links, platforms] = await Promise.all([
        lastValueFrom(this.eventService.getSocialLinks(this.eventId!)),
        lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.SOCIAL_PLATFORM)),
      ]);
      console.log('[EDIT] loadSocialLinks raw:', links);
      const mapped = links.map((link: any) => ({
        entitySocialLinkId: link.socialLinkId ?? link.entitySocialLinkId,
        entityId: link.entityId ?? this.eventId!,
        socialPlatformId: link.socialPlatformId,
        socialPlatformName: link.socialPlatformName,
        url: link.url,
      }));
      console.log('[EDIT] loadSocialLinks mapped:', mapped);
      this.socialLinks.set(mapped);
      this.socialPlatforms.set(platforms);
    } catch (e: any) {
      console.log('[EDIT] loadSocialLinks ERROR:', e?.message || e);
    }
    finally { this.socialLinksLoading.set(false); }
  }

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

  getPlatformName(platformId: number): string {
    return this.socialPlatforms().find(p => p.catalogueValueId === platformId)?.name || 'Red social';
  }

  async saveSocialLink(): Promise<void> {
    const sf = this.socialForm();
    if (!sf.socialPlatformId || !sf.url.trim()) return;
    this.savingSocialLink.set(true);
    try {
      const dto: CreateEntitySocialLinkDto = { entityId: this.eventId!, socialPlatformId: sf.socialPlatformId, url: sf.url.trim() };
      const edit = this.editingSocialLink();
      if (edit) {
        const updateDto: UpdateEntitySocialLinkDto = { socialPlatformId: sf.socialPlatformId, url: sf.url.trim() };
        await lastValueFrom(this.eventService.updateSocialLink(edit.entitySocialLinkId, updateDto));
      } else {
        await lastValueFrom(this.eventService.createSocialLink(dto));
      }
      this.cancelSocialForm();
      await this.loadSocialLinks();
    } catch { /* fallback */ }
    finally { this.savingSocialLink.set(false); }
  }

  async deleteSocialLink(link: EntitySocialLink): Promise<void> {
    try {
      await lastValueFrom(this.eventService.deleteSocialLink(link.entitySocialLinkId));
      await this.loadSocialLinks();
    } catch { /* fallback */ }
  }

  // ========== Portal ==========

  private async loadThemes(): Promise<void> {
    try {
      const themes = await lastValueFrom(this.catalogueService.getValuesByType(CATALOGUE_CODES.THEME_TYPE));
      this.themes.set(themes);
    } catch { /* fallback */ }
  }

  private async loadPortal(): Promise<void> {
    this.portalLoading.set(true);
    try {
      const [portal, themes] = await Promise.all([
        lastValueFrom(this.eventService.getPortal(this.eventId!)),
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
      this.themes.set(themes);
    } catch {
      this.themes.set([]);
    }
    finally { this.portalLoading.set(false); }
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
      const dto: CreateEntityPortalDto = {
        entityId: this.eventId!,
        subdomain,
        themeId: pf.themeId ?? undefined,
        isActive: pf.isActive,
        htmlContent: pf.htmlContent || undefined,
      };
      if (existing) {
        const updateDto: UpdateEntityPortalDto = {
          subdomain,
          themeId: pf.themeId ?? undefined,
          isActive: pf.isActive,
          htmlContent: pf.htmlContent || undefined,
        };
        const id = (existing as any).entityPortalId ?? (existing as any).portalId ?? existing.entityId;
        await lastValueFrom(this.eventService.updatePortal(id, updateDto));
        this.toastService.success('Portal guardado correctamente.');
      } else {
        await lastValueFrom(this.eventService.createPortal(dto));
        this.toastService.success('Portal creado correctamente.');
      }
      await this.loadPortal();
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
      this.toastService.success('Portal eliminado correctamente.');
    } catch {
      this.toastService.error('No se pudo eliminar el portal.');
    }
    finally { this.savingPortal.set(false); }
  }
}
