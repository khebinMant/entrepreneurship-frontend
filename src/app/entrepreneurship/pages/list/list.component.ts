import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { Category } from '../../models/category';
import { Entrepreneurship, EntrepreneurshipSearchFilters } from '../../models/entrepreneurship';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { CreateComponent } from '../create/create.component';
import type { Page } from '../../../shared/models/pagination';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, FormsModule, ModalComponent, CreateComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  readonly imageService = inject(ImageService);

  readonly entrepreneurships = signal<Entrepreneurship[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly pageData = signal<Pick<Page<Entrepreneurship>, 'totalElements' | 'totalPages' | 'number' | 'size'> | null>(null);
  readonly showCreateModal = signal(false);

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

  loadEntrepreneurships(): void {
    this.loading.set(true);
    const currentFilters = this.filters();
    this.entrepreneurshipService.searchPage({
      ...currentFilters,
      name: currentFilters.name || undefined,
      categoryId: currentFilters.categoryId || undefined,
      isPhysical: currentFilters.isPhysical,
      isDigital: currentFilters.isDigital,
      page: currentFilters.page ?? 0,
      size: currentFilters.size ?? this.pageSize,
    }).subscribe({
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
}
