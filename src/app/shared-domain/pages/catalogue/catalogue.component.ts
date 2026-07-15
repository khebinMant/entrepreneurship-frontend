import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { CatalogueService } from '../../services/catalogue.service';
import { ApiService } from '../../../core/http/services/api.service';
import { AppConfigService } from '../../../core/config/services/app-config.service';
import { API_ENDPOINTS } from '../../../core/constants/app.constants';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import type { CatalogueType, CreateCatalogueTypeDto, UpdateCatalogueTypeDto } from '../../models/catalogue-type';
import type { CatalogueValue, CreateCatalogueValueDto, UpdateCatalogueValueDto } from '../../models/catalogue-value';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [NgIf, FormsModule, ModalComponent],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {
  private readonly catalogueService = inject(CatalogueService);
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly sharedUrl = this.config.sharedUrl;

  readonly types = signal<CatalogueType[]>([]);
  readonly valuesByType = signal<Record<number, CatalogueValue[]>>({});
  readonly loading = signal(false);
  readonly valuesLoading = signal(false);

  readonly editingTypeId = signal<number | null>(null);
  readonly editingValueId = signal<number | null>(null);
  readonly expandedTypeId = signal<number | null>(null);
  readonly showDeleteTypeConfirm = signal(false);
  readonly deletingType = signal<CatalogueType | null>(null);
  readonly showDeleteValueConfirm = signal(false);
  readonly deletingValue = signal<CatalogueValue | null>(null);
  readonly deleting = signal(false);

  typeForm = signal<CreateCatalogueTypeDto>({ name: '', code: '', description: '' });
  valueForm = signal<CreateCatalogueValueDto>({ catalogueTypeId: 0, name: '', code: '', description: '' });
  newValueForm = signal<{ name: string; code: string; description: string }>({ name: '', code: '', description: '' });
  editTypeForm = signal<UpdateCatalogueTypeDto>({});
  editValueForm = signal<UpdateCatalogueValueDto>({});

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading.set(true);
    this.catalogueService.getTypes().subscribe({
      next: (types) => { this.types.set(types); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  async toggleExpand(type: CatalogueType): Promise<void> {
    if (this.expandedTypeId() === type.catalogueTypeId) {
      this.expandedTypeId.set(null);
      return;
    }
    this.expandedTypeId.set(type.catalogueTypeId);
    await this.loadValuesForType(type);
  }

  private async loadValuesForType(type: CatalogueType): Promise<void> {
    this.valuesLoading.set(true);
    this.catalogueService.getValuesByType(type.code).subscribe({
      next: (values) => {
        this.valuesByType.update(v => ({ ...v, [type.catalogueTypeId]: values }));
        this.valuesLoading.set(false);
      },
      error: () => this.valuesLoading.set(false),
    });
  }

  createType(): void {
    const form = this.typeForm();
    if (!form.name.trim() || !form.code.trim()) return;
    this.api.post<CatalogueType>(this.sharedUrl, API_ENDPOINTS.SHARED.CATALOGUE_TYPES, form).subscribe({
      next: (type) => {
        this.types.update(t => [...t, type]);
        this.typeForm.set({ name: '', code: '', description: '' });
      },
    });
  }

  startEditType(type: CatalogueType): void {
    this.editingTypeId.set(type.catalogueTypeId);
    this.editTypeForm.set({ name: type.name, code: type.code, description: type.description });
  }

  cancelEditType(): void {
    this.editingTypeId.set(null);
    this.editTypeForm.set({});
  }

  saveEditType(type: CatalogueType): void {
    const form = this.editTypeForm();
    if (!form.name?.trim() || !form.code?.trim()) return;
    this.api.put<CatalogueType>(this.sharedUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_TYPES}/${type.catalogueTypeId}`, form).subscribe({
      next: (updated) => {
        this.types.update(t => t.map(x => x.catalogueTypeId === type.catalogueTypeId ? updated : x));
        this.cancelEditType();
      },
    });
  }

  openDeleteTypeConfirm(type: CatalogueType): void {
    this.deletingType.set(type);
    this.showDeleteTypeConfirm.set(true);
  }

  cancelDeleteType(): void {
    this.showDeleteTypeConfirm.set(false);
    this.deletingType.set(null);
  }

  async confirmDeleteType(): Promise<void> {
    const type = this.deletingType();
    if (!type) return;
    this.deleting.set(true);
    try {
      await lastValueFrom(this.api.delete<void>(this.sharedUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_TYPES}/${type.catalogueTypeId}`));
      this.types.update(t => t.filter(x => x.catalogueTypeId !== type.catalogueTypeId));
      this.valuesByType.update(v => { const copy = { ...v }; delete copy[type.catalogueTypeId]; return copy; });
      if (this.expandedTypeId() === type.catalogueTypeId) this.expandedTypeId.set(null);
      this.cancelDeleteType();
    } catch {
      // fallback
    } finally {
      this.deleting.set(false);
    }
  }

  openDeleteValueConfirm(value: CatalogueValue): void {
    this.deletingValue.set(value);
    this.showDeleteValueConfirm.set(true);
  }

  cancelDeleteValue(): void {
    this.showDeleteValueConfirm.set(false);
    this.deletingValue.set(null);
  }

  async confirmDeleteValue(): Promise<void> {
    const value = this.deletingValue();
    if (!value) return;
    this.deleting.set(true);
    try {
      await lastValueFrom(this.api.delete<void>(this.sharedUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_VALUES}/${value.catalogueValueId}`));
      this.valuesByType.update(v => ({
        ...v,
        [value.catalogueTypeId]: (v[value.catalogueTypeId] || []).filter(x => x.catalogueValueId !== value.catalogueValueId),
      }));
      this.cancelDeleteValue();
    } catch {
      // fallback
    } finally {
      this.deleting.set(false);
    }
  }

  addValue(type: CatalogueType): void {
    const form = this.newValueForm();
    if (!form.name.trim() || !form.code.trim()) return;
    const payload: CreateCatalogueValueDto = { catalogueTypeId: type.catalogueTypeId, name: form.name, code: form.code, description: form.description };
    this.api.post<CatalogueValue>(this.sharedUrl, API_ENDPOINTS.SHARED.CATALOGUE_VALUES, payload).subscribe({
      next: (value) => {
        this.valuesByType.update(v => ({
          ...v,
          [type.catalogueTypeId]: [...(v[type.catalogueTypeId] || []), value],
        }));
        this.newValueForm.set({ name: '', code: '', description: '' });
      },
    });
  }

  startEditValue(value: CatalogueValue): void {
    this.editingValueId.set(value.catalogueValueId);
    this.editValueForm.set({ name: value.name, code: value.code, description: value.description });
  }

  cancelEditValue(): void {
    this.editingValueId.set(null);
    this.editValueForm.set({});
  }

  saveEditValue(value: CatalogueValue): void {
    const form = this.editValueForm();
    if (!form.name?.trim() || !form.code?.trim()) return;
    this.api.put<CatalogueValue>(this.sharedUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_VALUES}/${value.catalogueValueId}`, form).subscribe({
      next: (updated) => {
        this.valuesByType.update(v => {
          const typeId = value.catalogueTypeId;
          const arr = v[typeId] || [];
          return { ...v, [typeId]: arr.map(x => x.catalogueValueId === value.catalogueValueId ? updated : x) };
        });
        this.cancelEditValue();
      },
    });
  }
}
