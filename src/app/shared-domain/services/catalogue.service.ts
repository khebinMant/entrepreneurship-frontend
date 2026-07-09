import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/http/services/api.service';
import { API_ENDPOINTS } from '../../core/constants/app.constants';
import { AppConfigService } from '../../core/config/services/app-config.service';
import type { Observable } from 'rxjs';
import type { CatalogueType, CreateCatalogueTypeDto, UpdateCatalogueTypeDto } from '../models/catalogue-type';
import type { CatalogueValue, CreateCatalogueValueDto, UpdateCatalogueValueDto } from '../models/catalogue-value';

@Injectable({
  providedIn: 'root',
})
export class CatalogueService {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly baseUrl = this.config.sharedUrl;

  getTypes(): Observable<CatalogueType[]> {
    return this.api.get<CatalogueType[]>(this.baseUrl, API_ENDPOINTS.SHARED.CATALOGUE_TYPES);
  }

  getTypeById(id: number): Observable<CatalogueType> {
    return this.api.get<CatalogueType>(this.baseUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_TYPES}/${id}`);
  }

  getValuesByType(typeCode: string): Observable<CatalogueValue[]> {
    return this.api.get<CatalogueValue[]>(
      this.baseUrl,
      `${API_ENDPOINTS.SHARED.CATALOGUE_VALUES}/by-type/${typeCode}`,
    );
  }

  getValueById(id: number): Observable<CatalogueValue> {
    return this.api.get<CatalogueValue>(this.baseUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_VALUES}/${id}`);
  }

  getValueChildren(id: number): Observable<CatalogueValue[]> {
    return this.api.get<CatalogueValue[]>(this.baseUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_VALUES}/${id}/children`);
  }
}
