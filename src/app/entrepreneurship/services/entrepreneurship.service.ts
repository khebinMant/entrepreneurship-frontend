import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { API_ENDPOINTS } from '../../core/constants/app.constants';
import { AppConfigService } from '../../core/config/services/app-config.service';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Entrepreneurship, EntrepreneurshipSearchFilters } from '../models/entrepreneurship';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category';
import type { EntrepreneurshipLocation, CreateEntrepreneurshipLocationDto, UpdateEntrepreneurshipLocationDto } from '../models/entrepreneurship-location';
import type { EntrepreneurshipSocialLink, CreateEntrepreneurshipSocialLinkDto, UpdateEntrepreneurshipSocialLinkDto } from '../models/entrepreneurship-social-link';
import type { EntrepreneurshipPortal, CreateEntrepreneurshipPortalDto, UpdateEntrepreneurshipPortalDto } from '../models/entrepreneurship-portal';
import type { Page } from '../../shared/models/pagination';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EntrepreneurshipService {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly baseUrl = this.config.entrepreneurshipUrl;

  getAll(): Observable<Entrepreneurship[]> {
    return this.api.get<Entrepreneurship[]>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.BASE);
  }

  getById(id: number): Observable<Entrepreneurship> {
    return this.api.get<Entrepreneurship>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.BASE}/${id}`);
  }

  getByUserId(userId: number): Observable<Entrepreneurship[]> {
    return this.api.get<Entrepreneurship[]>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.BY_USER(userId));
  }

  search(filters: EntrepreneurshipSearchFilters): Observable<Entrepreneurship[]> {
    return this.searchPage(filters).pipe(map((page) => page.content));
  }

  searchPage(filters: EntrepreneurshipSearchFilters): Observable<Page<Entrepreneurship>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.isPhysical !== undefined) params = params.set('isPhysical', filters.isPhysical.toString());
    if (filters.isDigital !== undefined) params = params.set('isDigital', filters.isDigital.toString());
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    return this.api.get<Page<Entrepreneurship>>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.SEARCH, params);
  }

  create(data: { userId: number; categoryId: number; name: string; description: string; isPhysical: boolean; isDigital: boolean }): Observable<Entrepreneurship> {
    return this.api.post<Entrepreneurship>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.BASE, data);
  }

  update(id: number, data: { name?: string; description?: string; categoryId?: number; isPhysical?: boolean; isDigital?: boolean }): Observable<Entrepreneurship> {
    return this.api.put<Entrepreneurship>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.BASE}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.BASE}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.api.get<Category[]>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.CATEGORIES);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.api.get<Category>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.CATEGORIES}/${id}`);
  }

  getLocations(entrepreneurshipId: number): Observable<EntrepreneurshipLocation[]> {
    return this.api.get<EntrepreneurshipLocation[]>(
      this.baseUrl,
      `${API_ENDPOINTS.ENTREPRENEURSHIPS.LOCATIONS}/entrepreneurship/${entrepreneurshipId}`,
    );
  }

  createLocation(dto: CreateEntrepreneurshipLocationDto): Observable<EntrepreneurshipLocation> {
    return this.api.post<EntrepreneurshipLocation>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.LOCATIONS, dto);
  }

  updateLocation(id: number, dto: UpdateEntrepreneurshipLocationDto): Observable<EntrepreneurshipLocation> {
    return this.api.put<EntrepreneurshipLocation>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.LOCATIONS}/${id}`, dto);
  }

  deleteLocation(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.LOCATIONS}/${id}`);
  }

  getSocialLinks(entrepreneurshipId: number): Observable<EntrepreneurshipSocialLink[]> {
    return this.api.get<EntrepreneurshipSocialLink[]>(
      this.baseUrl,
      `${API_ENDPOINTS.ENTREPRENEURSHIPS.SOCIAL_LINKS}/entrepreneurship/${entrepreneurshipId}`,
    );
  }

  createSocialLink(dto: CreateEntrepreneurshipSocialLinkDto): Observable<EntrepreneurshipSocialLink> {
    return this.api.post<EntrepreneurshipSocialLink>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.SOCIAL_LINKS, dto);
  }

  updateSocialLink(id: number, dto: UpdateEntrepreneurshipSocialLinkDto): Observable<EntrepreneurshipSocialLink> {
    return this.api.put<EntrepreneurshipSocialLink>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.SOCIAL_LINKS}/${id}`, dto);
  }

  deleteSocialLink(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.SOCIAL_LINKS}/${id}`);
  }

  getPortal(entrepreneurshipId: number): Observable<EntrepreneurshipPortal> {
    return this.api.get<EntrepreneurshipPortal>(
      this.baseUrl,
      `${API_ENDPOINTS.ENTREPRENEURSHIPS.PORTALS}/entrepreneurship/${entrepreneurshipId}`,
    );
  }

  createPortal(dto: CreateEntrepreneurshipPortalDto): Observable<EntrepreneurshipPortal> {
    return this.api.post<EntrepreneurshipPortal>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.PORTALS, dto);
  }

  updatePortal(id: number, dto: UpdateEntrepreneurshipPortalDto): Observable<EntrepreneurshipPortal> {
    return this.api.put<EntrepreneurshipPortal>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.PORTALS}/${id}`, dto);
  }

  deletePortal(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.PORTALS}/${id}`);
  }
}
