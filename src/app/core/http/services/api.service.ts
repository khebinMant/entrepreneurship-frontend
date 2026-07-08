import { inject, Injectable } from '@angular/core';
import type { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(baseUrl: string, path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${baseUrl}${path}`, { params });
  }

  post<T>(baseUrl: string, path: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http.post<T>(`${baseUrl}${path}`, body, { params });
  }

  put<T>(baseUrl: string, path: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http.put<T>(`${baseUrl}${path}`, body, { params });
  }

  patch<T>(baseUrl: string, path: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http.patch<T>(`${baseUrl}${path}`, body, { params });
  }

  delete<T>(baseUrl: string, path: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(`${baseUrl}${path}`, { params });
  }

  upload<T>(baseUrl: string, path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${baseUrl}${path}`, formData);
  }
}
