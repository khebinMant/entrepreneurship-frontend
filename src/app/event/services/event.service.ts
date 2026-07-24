import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { API_ENDPOINTS } from '../../core/constants/app.constants';
import { AppConfigService } from '../../core/config/services/app-config.service';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Event, EventSearchFilters } from '../models/event';
import type { EventSpace, CreateEventSpaceDto, UpdateEventSpaceDto } from '../models/event-space';
import type { EventInvitation, CreateEventInvitationDto, BulkCreateInvitationDto, EventParticipant } from '../models/event-invitation';
import type { EntitySocialLink, CreateEntitySocialLinkDto, UpdateEntitySocialLinkDto } from '../../entrepreneurship/models/entrepreneurship-social-link';
import type { EntityPortal, CreateEntityPortalDto, UpdateEntityPortalDto } from '../../entrepreneurship/models/entrepreneurship-portal';
import type { Page } from '../../shared/models/pagination';
import type { EventGlobalAnalytics, UserEventStats } from '../../shared/models/analytics';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly baseUrl = this.config.eventUrl;

  getAll(): Observable<Event[]> {
    return this.api.get<Event[]>(this.baseUrl, API_ENDPOINTS.EVENTS.BASE);
  }

  getById(id: number): Observable<Event> {
    return this.api.get<Event>(this.baseUrl, `${API_ENDPOINTS.EVENTS.BASE}/${id}`);
  }

  getByCreator(userId: number): Observable<Event[]> {
    return this.api.get<Event[]>(this.baseUrl, API_ENDPOINTS.EVENTS.BY_CREATOR(userId));
  }

  search(filters: EventSearchFilters): Observable<Event[]> {
    return this.searchPage(filters).pipe(map((page) => page.content));
  }

  searchPage(filters: EventSearchFilters): Observable<Page<Event>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.eventTypeId) params = params.set('eventTypeId', filters.eventTypeId.toString());
    if (filters.eventVisibilityId) params = params.set('eventVisibilityId', filters.eventVisibilityId.toString());
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    return this.api.get<Page<Event>>(this.baseUrl, API_ENDPOINTS.EVENTS.SEARCH, params);
  }

  searchPageByCreator(userId: number, filters: EventSearchFilters): Observable<Page<Event>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.eventTypeId) params = params.set('eventTypeId', filters.eventTypeId.toString());
    if (filters.eventVisibilityId) params = params.set('eventVisibilityId', filters.eventVisibilityId.toString());
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    return this.api.get<Page<Event>>(this.baseUrl, API_ENDPOINTS.EVENTS.BY_CREATOR(userId), params);
  }

  create(data: {
    createdByUserId: number;
    name: string;
    description: string;
    eventTypeId: number;
    eventVisibilityId: number;
    isPaid: boolean;
    price?: number;
    startDatetime: string;
    endDatetime: string;
    countryId: number;
    provinceId: number;
    cityId: number;
    addressLine?: string;
    maxAttendees?: number;
    maxEntrepreneurships?: number;
  }): Observable<Event> {
    return this.api.post<Event>(this.baseUrl, API_ENDPOINTS.EVENTS.BASE, data);
  }

  update(id: number, data: Partial<{
    createdByUserId: number;
    name: string;
    description: string;
    eventTypeId: number;
    eventVisibilityId: number;
    isPaid: boolean;
    price: number;
    startDatetime: string;
    endDatetime: string;
    countryId: number;
    provinceId: number;
    cityId: number;
    addressLine: string;
    maxAttendees: number;
    maxEntrepreneurships: number;
  }>): Observable<Event> {
    return this.api.put<Event>(this.baseUrl, `${API_ENDPOINTS.EVENTS.BASE}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.EVENTS.BASE}/${id}`);
  }

  getSpaces(eventId: number): Observable<EventSpace[]> {
    return this.api.get<EventSpace[]>(this.baseUrl, `${API_ENDPOINTS.EVENTS.SPACES}/event/${eventId}`);
  }

  createSpace(dto: CreateEventSpaceDto): Observable<EventSpace> {
    return this.api.post<EventSpace>(this.baseUrl, API_ENDPOINTS.EVENTS.SPACES, dto);
  }

  updateSpace(id: number, dto: UpdateEventSpaceDto): Observable<EventSpace> {
    return this.api.put<EventSpace>(this.baseUrl, `${API_ENDPOINTS.EVENTS.SPACES}/${id}`, dto);
  }

  deleteSpace(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.EVENTS.SPACES}/${id}`);
  }

  getInvitationById(invitationId: number): Observable<EventInvitation> {
    return this.api.get<EventInvitation>(this.baseUrl, `${API_ENDPOINTS.EVENTS.INVITATIONS}/${invitationId}`);
  }

  getInvitations(eventId: number, statusId?: number): Observable<EventInvitation[]> {
    let params = new HttpParams();
    if (statusId !== undefined) params = params.set('statusId', statusId.toString());
    return this.api.get<EventInvitation[]>(
      this.baseUrl,
      `${API_ENDPOINTS.EVENTS.INVITATIONS}/event/${eventId}`,
      params,
    );
  }

  createInvitation(dto: CreateEventInvitationDto): Observable<EventInvitation> {
    return this.api.post<EventInvitation>(this.baseUrl, API_ENDPOINTS.EVENTS.INVITATIONS, dto);
  }

  createInvitationsBulk(dto: BulkCreateInvitationDto): Observable<EventInvitation[]> {
    return this.api.post<EventInvitation[]>(this.baseUrl, `${API_ENDPOINTS.EVENTS.INVITATIONS}/bulk`, dto);
  }

  updateInvitationStatus(id: number, statusId: number, message?: string): Observable<EventInvitation> {
    let params = new HttpParams().set('statusId', statusId.toString());
    if (message) params = params.set('message', message);
    return this.api.patch<EventInvitation>(
      this.baseUrl,
      `${API_ENDPOINTS.EVENTS.INVITATIONS}/${id}/status`,
      {},
      params,
    );
  }

  deleteInvitation(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.EVENTS.INVITATIONS}/${id}`);
  }

  getParticipants(eventId: number, statusId?: number): Observable<EventParticipant[]> {
    let params = new HttpParams();
    if (statusId !== undefined) params = params.set('statusId', statusId.toString());
    return this.api.get<EventParticipant[]>(
      this.baseUrl,
      `${API_ENDPOINTS.EVENTS.PARTICIPANTS}/event/${eventId}`,
      params,
    );
  }

  // --- Social Links ---
  getSocialLinks(entityId: number): Observable<EntitySocialLink[]> {
    return this.api.get<EntitySocialLink[]>(this.baseUrl, `${API_ENDPOINTS.SHARED.ENTITY_SOCIAL_LINKS}/by-entity/${entityId}`);
  }
  createSocialLink(dto: CreateEntitySocialLinkDto): Observable<EntitySocialLink> {
    return this.api.post<EntitySocialLink>(this.baseUrl, API_ENDPOINTS.SHARED.ENTITY_SOCIAL_LINKS, dto);
  }
  updateSocialLink(id: number, dto: UpdateEntitySocialLinkDto): Observable<EntitySocialLink> {
    return this.api.put<EntitySocialLink>(this.baseUrl, `${API_ENDPOINTS.SHARED.ENTITY_SOCIAL_LINKS}/${id}`, dto);
  }
  deleteSocialLink(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.SHARED.ENTITY_SOCIAL_LINKS}/${id}`);
  }

  // --- Portal ---
  getPortal(entityId: number): Observable<EntityPortal> {
    return this.api.get<EntityPortal>(this.baseUrl, `${API_ENDPOINTS.SHARED.ENTITY_PORTALS}/by-entity/${entityId}`);
  }
  createPortal(dto: CreateEntityPortalDto): Observable<EntityPortal> {
    return this.api.post<EntityPortal>(this.baseUrl, API_ENDPOINTS.SHARED.ENTITY_PORTALS, dto);
  }
  updatePortal(id: number, dto: UpdateEntityPortalDto): Observable<EntityPortal> {
    return this.api.put<EntityPortal>(this.baseUrl, `${API_ENDPOINTS.SHARED.ENTITY_PORTALS}/${id}`, dto);
  }
  deletePortal(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.SHARED.ENTITY_PORTALS}/${id}`);
  }

  getAnalyticsGlobal(): Observable<EventGlobalAnalytics> {
    return this.api.get<EventGlobalAnalytics>(this.baseUrl, API_ENDPOINTS.EVENTS.ANALYTICS_GLOBAL);
  }

  getStatsByCreator(userId: number): Observable<UserEventStats> {
    return this.api.get<UserEventStats>(this.baseUrl, API_ENDPOINTS.EVENTS.STATS_CREATOR(userId));
  }
}
