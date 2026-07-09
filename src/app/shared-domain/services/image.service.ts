import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { API_ENDPOINTS, ENTITY_TYPE } from '../../core/constants/app.constants';
import { AppConfigService } from '../../core/config/services/app-config.service';
import { Observable } from 'rxjs';
import type { ImageGallery, ImageUploadResponse } from '../models/image-gallery';
import { HttpParams as AngularHttpParams } from '@angular/common/http';

const DEFAULT_IMAGES: Record<string, string> = {
  USER: 'https://picsum.photos/seed/user/150/150',
  ENTREPRENEURSHIP: 'https://picsum.photos/seed/entrepreneurship/600/400',
  EVENT: 'https://picsum.photos/seed/event/1200/500',
};

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly baseUrl = this.config.sharedUrl;
  private readonly cache = new Map<string, ImageGallery[]>();

  getDefaultImage(entityType: string, seed?: number | string): string {
    if (seed == null) seed = entityType;
    const key = entityType.toUpperCase();
    const fallback = DEFAULT_IMAGES[key] ?? DEFAULT_IMAGES['USER'];
    if (seed != null) {
      return `https://picsum.photos/seed/${seed}/600/400`;
    }
    return fallback;
  }

  getEntityImageUrl(entity: { imageUrl?: string | null; imageId?: number | null } | null, entityType: string, seed?: number): string {
    if (entity?.imageUrl) return entity.imageUrl;
    const id = seed ?? entity?.imageId ?? undefined;
    return this.getDefaultImage(entityType, id);
  }

  list(entityType: string, entityId: number): Observable<ImageGallery[]> {
    const cacheKey = `${entityType}-${entityId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }
    let params = new AngularHttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId.toString());
    const obs = this.api.get<ImageGallery[]>(this.baseUrl, API_ENDPOINTS.SHARED.IMAGES, params);
    obs.subscribe((images) => this.cache.set(cacheKey, images));
    return obs;
  }

  getById(id: number): Observable<ImageGallery> {
    return this.api.get<ImageGallery>(this.baseUrl, `${API_ENDPOINTS.SHARED.IMAGES}/${id}`);
  }

  upload(
    file: File,
    entityType: string,
    entityId: number,
    displayOrder = 0,
    altText?: string,
    uploadedByUserId?: number,
  ): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId.toString());
    formData.append('displayOrder', displayOrder.toString());
    if (altText) {
      formData.append('altText', altText);
    }
    if (uploadedByUserId != null) {
      formData.append('uploadedByUserId', uploadedByUserId.toString());
    }
    this.invalidateCache(entityType, entityId);
    return this.api.upload<ImageUploadResponse>(this.baseUrl, `${API_ENDPOINTS.SHARED.IMAGES}/upload`, formData);
  }

  delete(id: number, entityType?: string, entityId?: number): Observable<void> {
    if (entityType && entityId != null) this.invalidateCache(entityType, entityId);
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.SHARED.IMAGES}/${id}`);
  }

  deleteAll(entityType: string, entityId: number): Observable<void> {
    this.invalidateCache(entityType, entityId);
    let params = new AngularHttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId.toString());
    return this.api.delete<void>(this.baseUrl, API_ENDPOINTS.SHARED.IMAGES, params);
  }

  reorder(entityType: string, entityId: number, orderedImageIds: number[]): Observable<void> {
    this.invalidateCache(entityType, entityId);
    let params = new AngularHttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId.toString());
    return this.api.post<void>(this.baseUrl, `${API_ENDPOINTS.SHARED.IMAGES}/reorder`, orderedImageIds, params);
  }

  count(entityType: string, entityId: number): Observable<number> {
    let params = new AngularHttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId.toString());
    return this.api.get<number>(this.baseUrl, `${API_ENDPOINTS.SHARED.IMAGES}/count`, params);
  }

  canAddMore(entityType: string, entityId: number): Observable<boolean> {
    let params = new AngularHttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId.toString());
    return this.api.get<boolean>(this.baseUrl, `${API_ENDPOINTS.SHARED.IMAGES}/can-add-more`, params);
  }

  invalidateCache(entityType: string, entityId: number): void {
    this.cache.delete(`${entityType}-${entityId}`);
  }
}
