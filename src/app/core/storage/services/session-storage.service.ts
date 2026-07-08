import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  get<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    if (!item) {
      return null;
    }
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  }

  set(key: string, value: unknown): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}
