import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private readonly collapsed = signal(false);
  readonly isCollapsed = this.collapsed.asReadonly();

  toggle(): void {
    this.collapsed.update((v) => !v);
  }

  setCollapsed(value: boolean): void {
    this.collapsed.set(value);
  }
}
