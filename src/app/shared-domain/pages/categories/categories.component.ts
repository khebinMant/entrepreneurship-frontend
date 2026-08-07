import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../../../core/http/services/api.service';
import { AppConfigService } from '../../../core/config/services/app-config.service';
import { API_ENDPOINTS } from '../../../core/constants/app.constants';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import type { Category } from '../../../entrepreneurship/models/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgIf, FormsModule, ModalComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = this.config.entrepreneurshipUrl;

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly newCategoryName = signal('');
  readonly newCategoryDescription = signal('');
  readonly editName = signal('');
  readonly editDescription = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingCategory = signal<Category | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.api.get<Category[]>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.CATEGORIES).subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startEdit(category: Category): void {
    this.editingId.set(category.categoryId);
    this.editName.set(category.name);
    this.editDescription.set(category.description ?? '');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editName.set('');
    this.editDescription.set('');
  }

  saveEdit(category: Category): void {
    const name = this.editName().trim();
    if (!name) return;
    const body: Record<string, string> = { name };
    const desc = this.editDescription().trim();
    if (desc) body['description'] = desc;
    this.api.put<Category>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.CATEGORIES}/${category.categoryId}`, body)
      .subscribe({
        next: (updated) => {
          this.categories.update((cats) =>
            cats.map((c) => (c.categoryId === category.categoryId ? updated : c)),
          );
          this.cancelEdit();
          this.toastService.success('Categoría actualizada correctamente.');
        },
      });
  }

  addCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    const body: Record<string, string> = { name };
    const desc = this.newCategoryDescription().trim();
    if (desc) body['description'] = desc;
    this.api.post<Category>(this.baseUrl, API_ENDPOINTS.ENTREPRENEURSHIPS.CATEGORIES, body)
      .subscribe({
        next: (cat) => {
          this.categories.update((cats) => [...cats, cat]);
          this.newCategoryName.set('');
          this.newCategoryDescription.set('');
          this.toastService.success('Categoría creada correctamente.');
        },
      });
  }

  openDeleteConfirm(category: Category): void {
    this.deletingCategory.set(category);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingCategory.set(null);
  }

  async confirmDelete(): Promise<void> {
    const category = this.deletingCategory();
    if (!category) return;
    this.deleting.set(true);
    try {
      await lastValueFrom(this.api.delete<void>(this.baseUrl, `${API_ENDPOINTS.ENTREPRENEURSHIPS.CATEGORIES}/${category.categoryId}`));
      this.categories.update((cats) => cats.filter((c) => c.categoryId !== category.categoryId));
      this.cancelDelete();
      this.toastService.success('Categoría eliminada correctamente.');
    } catch {
      this.toastService.error('No se pudo eliminar la categoría.');
    } finally {
      this.deleting.set(false);
    }
  }
}
