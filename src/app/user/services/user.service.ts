import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { API_ENDPOINTS } from '../../core/constants/app.constants';
import { AppConfigService } from '../../core/config/services/app-config.service';
import type { Observable } from 'rxjs';
import type { User } from '../models/user';
import type { UserContact, CreateUserContactDto, UpdateUserContactDto } from '../models/user-contact';
import type { UserAddress, CreateUserAddressDto, UpdateUserAddressDto } from '../models/user-address';
import type { UserIdentification, CreateUserIdentificationDto, UpdateUserIdentificationDto } from '../models/user-identification';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly baseUrl = this.config.userUrl;

  getAll(): Observable<User[]> {
    return this.api.get<User[]>(this.baseUrl, API_ENDPOINTS.USERS.BASE);
  }

  getById(id: number): Observable<User> {
    return this.api.get<User>(this.baseUrl, `${API_ENDPOINTS.USERS.BASE}/${id}`);
  }

  getByKeycloakId(keycloakId: string): Observable<User> {
    return this.api.get<User>(this.baseUrl, API_ENDPOINTS.USERS.BY_KEYCLOAK_ID(keycloakId));
  }

  create(data: { keycloakId: string; firstName: string; lastName: string }): Observable<User> {
    return this.api.post<User>(this.baseUrl, API_ENDPOINTS.USERS.BASE, data);
  }

  update(id: number, data: { firstName?: string; lastName?: string }): Observable<User> {
    return this.api.put<User>(this.baseUrl, `${API_ENDPOINTS.USERS.BASE}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.USERS.BASE}/${id}`);
  }

  getContacts(userId: number): Observable<UserContact[]> {
    return this.api.get<UserContact[]>(this.baseUrl, API_ENDPOINTS.USERS.CONTACTS);
  }

  createContact(dto: CreateUserContactDto): Observable<UserContact> {
    return this.api.post<UserContact>(this.baseUrl, API_ENDPOINTS.USERS.CONTACTS, dto);
  }

  updateContact(id: number, dto: UpdateUserContactDto): Observable<UserContact> {
    return this.api.put<UserContact>(this.baseUrl, `${API_ENDPOINTS.USERS.CONTACTS}/${id}`, dto);
  }

  deleteContact(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.USERS.CONTACTS}/${id}`);
  }

  getAddresses(): Observable<UserAddress[]> {
    return this.api.get<UserAddress[]>(this.baseUrl, API_ENDPOINTS.USERS.ADDRESSES);
  }

  createAddress(dto: CreateUserAddressDto): Observable<UserAddress> {
    return this.api.post<UserAddress>(this.baseUrl, API_ENDPOINTS.USERS.ADDRESSES, dto);
  }

  updateAddress(id: number, dto: UpdateUserAddressDto): Observable<UserAddress> {
    return this.api.put<UserAddress>(this.baseUrl, `${API_ENDPOINTS.USERS.ADDRESSES}/${id}`, dto);
  }

  deleteAddress(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.USERS.ADDRESSES}/${id}`);
  }

  getIdentifications(): Observable<UserIdentification[]> {
    return this.api.get<UserIdentification[]>(this.baseUrl, API_ENDPOINTS.USERS.IDENTIFICATIONS);
  }

  createIdentification(dto: CreateUserIdentificationDto): Observable<UserIdentification> {
    return this.api.post<UserIdentification>(this.baseUrl, API_ENDPOINTS.USERS.IDENTIFICATIONS, dto);
  }

  updateIdentification(id: number, dto: UpdateUserIdentificationDto): Observable<UserIdentification> {
    return this.api.put<UserIdentification>(this.baseUrl, `${API_ENDPOINTS.USERS.IDENTIFICATIONS}/${id}`, dto);
  }

  deleteIdentification(id: number): Observable<void> {
    return this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.USERS.IDENTIFICATIONS}/${id}`);
  }
}
