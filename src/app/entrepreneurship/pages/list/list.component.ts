import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { Category } from '../../models/category';
import { Entrepreneurship, EntrepreneurshipSearchFilters } from '../../models/entrepreneurship';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import type { Page } from '../../../shared/models/pagination';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, FormsModule, ModalComponent, CreateComponent, EditComponent, ClickOutsideDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  readonly imageService = inject(ImageService);
  private readonly toastService = inject(ToastService);

  readonly entrepreneurships = signal<Entrepreneurship[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly pageData = signal<Pick<Page<Entrepreneurship>, 'totalElements' | 'totalPages' | 'number' | 'size'> | null>(null);
  readonly showCreateModal = signal(false);
  readonly showEditModal = signal(false);
  readonly editingEntrepreneurship = signal<Entrepreneurship | null>(null);
  readonly showDeleteConfirm = signal(false);
  readonly deletingEntrepreneurship = signal<Entrepreneurship | null>(null);
  readonly deleting = signal(false);
  readonly openMenuId = signal<number | null>(null);

  readonly pageSize = 10;

  filters = signal<EntrepreneurshipSearchFilters>({
    name: '',
    categoryId: undefined,
    isPhysical: undefined,
    isDigital: undefined,
    page: 0,
    size: this.pageSize,
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadEntrepreneurships();
  }

  loadCategories(): void {
    this.entrepreneurshipService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  get isAppRoute(): boolean {
    return this.router.url.startsWith('/app/');
  }

  loadEntrepreneurships(): void {
    this.loading.set(true);
    const currentFilters = this.filters();

    const obs$ = this.isAppRoute
      ? this.entrepreneurshipService.searchPageByUser(this.authService.backendUserId()!, {
          ...currentFilters,
          name: currentFilters.name || undefined,
          categoryId: currentFilters.categoryId || undefined,
          isPhysical: currentFilters.isPhysical,
          isDigital: currentFilters.isDigital,
          page: currentFilters.page ?? 0,
          size: currentFilters.size ?? this.pageSize,
        })
      : this.entrepreneurshipService.searchPage({
          ...currentFilters,
          name: currentFilters.name || undefined,
          categoryId: currentFilters.categoryId || undefined,
          isPhysical: currentFilters.isPhysical,
          isDigital: currentFilters.isDigital,
          page: currentFilters.page ?? 0,
          size: currentFilters.size ?? this.pageSize,
        });

    obs$.subscribe({
      next: (page) => {
        this.entrepreneurships.set(page.content);
        this.pageData.set({
          totalElements: page.totalElements,
          totalPages: page.totalPages,
          number: page.number,
          size: page.size,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.filters.update((f) => ({ ...f, page: 0 }));
    this.loadEntrepreneurships();
  }

  onFilterChange(): void {
    this.filters.update((f) => ({ ...f, page: 0 }));
    this.loadEntrepreneurships();
  }

  goToPage(page: number): void {
    this.filters.update((f) => ({ ...f, page }));
    this.loadEntrepreneurships();
  }

  getPageNumbers(): number[] {
    const data = this.pageData();
    if (!data) return [];
    const total = data.totalPages;
    const current = data.number;
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getImageUrl(entrepreneurship: Entrepreneurship): string {
    return this.imageService.getEntityImageUrl(entrepreneurship, 'ENTREPRENEURSHIP', entrepreneurship.entrepreneurshipId);
  }

  trackById(index: number, item: Entrepreneurship): number {
    return item.entrepreneurshipId;
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.loadEntrepreneurships();
  }

  openEditModal(entrepreneurship: Entrepreneurship): void {
    this.editingEntrepreneurship.set(entrepreneurship);
    this.showEditModal.set(true);
    this.openMenuId.set(null);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingEntrepreneurship.set(null);
    this.loadEntrepreneurships();
  }

  openDeleteConfirm(entrepreneurship: Entrepreneurship): void {
    this.deletingEntrepreneurship.set(entrepreneurship);
    this.showDeleteConfirm.set(true);
    this.openMenuId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingEntrepreneurship.set(null);
  }

  async confirmDelete(): Promise<void> {
    const entrepreneurship = this.deletingEntrepreneurship();
    if (!entrepreneurship) return;
    this.deleting.set(true);
    try {
      await lastValueFrom(this.entrepreneurshipService.delete(entrepreneurship.entrepreneurshipId));
      this.showDeleteConfirm.set(false);
      this.deletingEntrepreneurship.set(null);
      this.loadEntrepreneurships();
      this.toastService.success(`Emprendimiento "${entrepreneurship.name}" eliminado correctamente.`);
    } catch (err) {
      console.error('Error deleting entrepreneurship:', err);
      this.toastService.error('No se pudo eliminar el emprendimiento.');
    } finally {
      this.deleting.set(false);
    }
  }

  toggleMenu(id: number): void {
    this.openMenuId.update(current => current === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }
}
