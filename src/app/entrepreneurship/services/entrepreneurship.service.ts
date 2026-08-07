import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { API_ENDPOINTS } from '../../core/constants/app.constants';
import { AppConfigService } from '../../core/config/services/app-config.service';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Entrepreneurship, EntrepreneurshipSearchFilters, CreateEntrepreneurshipDto } from '../models/entrepreneurship';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category';
import type { EntrepreneurshipLocation, CreateEntrepreneurshipLocationDto, UpdateEntrepreneurshipLocationDto } from '../models/entrepreneurship-location';
import type { EntitySocialLink, CreateEntitySocialLinkDto, UpdateEntitySocialLinkDto } from '../models/entrepreneurship-social-link';
import type { EntityPortal, CreateEntityPortalDto, UpdateEntityPortalDto } from '../models/entrepreneurship-portal';
import type { Page } from '../../shared/models/pagination';
import type { EntrepreneurshipGlobalAnalytics, UserEntrepreneurshipStats } from '../../shared/models/analytics';
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

  searchPageByUser(userId: number, filters: EntrepreneurshipSearchFilters): Observable<Page<Entrepreneurship>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.isPhysical !== undefined) params = params.set('isPhysical', filters.isPhysical.toString());
    if (filters.isDigital !== undefined) params = params.set('isDigital', filters.isDigital.toString());
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    return this.api.get<Page<Entrepreneurship>>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.BY_USER(userId), params);
  }

  create(data: CreateEntrepreneurshipDto): Observable<Entrepreneurship> {
    return this.api.post<Entrepreneurship>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.BASE, data);
  }

  update(id: number, data: { userId: number; name?: string; description?: string; categoryId?: number; isPhysical?: boolean; isDigital?: boolean }): Observable<Entrepreneurship> {
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

  getSocialLinks(entityId: number): Observable<EntitySocialLink[]> {
    return this.api.get<EntitySocialLink[]>(
      this.baseUrl,
      `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_SOCIAL_LINKS}/by-entity/${entityId}`,
    );
  }

  createSocialLink(dto: CreateEntitySocialLinkDto): Observable<EntitySocialLink> {
    return this.api.post<EntitySocialLink>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_SOCIAL_LINKS, dto);
  }

  updateSocialLink(id: number, dto: UpdateEntitySocialLinkDto): Observable<EntitySocialLink> {
    return this.api.put<EntitySocialLink>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_SOCIAL_LINKS}/${id}`, dto);
  }

  deleteSocialLink(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_SOCIAL_LINKS}/${id}`);
  }

  getPortal(entityId: number): Observable<EntityPortal> {
    return this.api.get<EntityPortal>(
      this.baseUrl,
      `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_PORTALS}/by-entity/${entityId}`,
    );
  }

  getPortalBySubdomain(subdomain: string): Observable<EntityPortal> {
    return this.api.get<EntityPortal>(
      this.baseUrl,
      `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_PORTALS}/by-subdomain/${encodeURIComponent(subdomain)}`,
    );
  }

  createPortal(dto: CreateEntityPortalDto): Observable<EntityPortal> {
    return this.api.post<EntityPortal>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_PORTALS, dto);
  }

  updatePortal(id: number, dto: UpdateEntityPortalDto): Observable<EntityPortal> {
    return this.api.put<EntityPortal>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_PORTALS}/${id}`, dto);
  }

  deletePortal(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.ENTITY_PORTALS}/${id}`);
  }

  getAnalyticsGlobal(): Observable<EntrepreneurshipGlobalAnalytics> {
    return this.api.get<EntrepreneurshipGlobalAnalytics>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.ANALYTICS_GLOBAL);
  }

  getStatsByUser(userId: number): Observable<UserEntrepreneurshipStats> {
    return this.api.get<UserEntrepreneurshipStats>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.STATS_USER(userId));
  }
}
