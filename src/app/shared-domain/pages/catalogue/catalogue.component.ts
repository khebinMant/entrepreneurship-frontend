import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogueService } from '../../services/catalogue.service';
import { ApiService } from '../../../core/http/services/api.service';
import { AppConfigService } from '../../../core/config/services/app-config.service';
import { API_ENDPOINTS } from '../../../core/constants/app.constants';
import { CatalogueType, CreateCatalogueTypeDto, UpdateCatalogueTypeDto } from '../../models/catalogue-type';
import { CatalogueValue, CreateCatalogueValueDto, UpdateCatalogueValueDto } from '../../models/catalogue-value';

type ActiveTab = 'types' | 'values';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {
  private readonly catalogueService = inject(CatalogueService);
  private readonly api = inject(ApiService);
  private readonly config = inject(AppConfigService);
  private readonly sharedUrl = this.config.sharedUrl;

  readonly activeTab = signal<ActiveTab>('types');
  readonly types = signal<CatalogueType[]>([]);
  readonly values = signal<CatalogueValue[]>([]);
  readonly selectedType = signal<CatalogueType | null>(null);
  readonly loading = signal(false);

  readonly editingTypeId = signal<number | null>(null);
  readonly editingValueId = signal<number | null>(null);
  readonly expandedTypeId = signal<number | null>(null);

  typeForm = signal<CreateCatalogueTypeDto>({ name: '', code: '', description: '' });
  valueForm = signal<CreateCatalogueValueDto>({ catalogueTypeId: 0, name: '', code: '', description: '' });
  editTypeForm = signal<UpdateCatalogueTypeDto>({});
  editValueForm = signal<UpdateCatalogueValueDto>({});

  readonly typeCodeFilter = signal('');

  ngOnInit(): void {
    this.loadTypes();
  }

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'values') {
      this.loadValues();
    }
  }

  loadTypes(): void {
    this.loading.set(true);
    this.catalogueService.getTypes().subscribe({
      next: (types) => { this.types.set(types); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadValues(): void {
    this.loading.set(true);
    if (this.selectedType()) {
      this.catalogueService.getValuesByType(this.selectedType()!.code).subscribe({
        next: (values) => { this.values.set(values); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.values.set([]);
      this.loading.set(false);
    }
  }

  selectType(type: CatalogueType): void {
    this.selectedType.set(type);
    this.typeCodeFilter.set(type.code);
    this.loadValues();
  }

  toggleExpand(type: CatalogueType): void {
    if (this.expandedTypeId() === type.catalogueTypeId) {
      this.expandedTypeId.set(null);
    } else {
      this.expandedTypeId.set(type.catalogueTypeId);
      this.selectedType.set(type);
      this.typeCodeFilter.set(type.code);
      this.loadValues();
    }
  }

  createType(): void {
    const form = this.typeForm();
    if (!form.name.trim() || !form.code.trim()) return;
    this.api.post<CatalogueType>(this.sharedUrl, API_ENDPOINTS.SHARED.CATALOGUE_TYPES, form).subscribe({
      next: (type) => {
        this.types.update((t) => [...t, type]);
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
        this.types.update((t) => t.map((x) => x.catalogueTypeId === type.catalogueTypeId ? updated : x));
        this.cancelEditType();
      },
    });
  }

  deleteType(id: number): void {
    if (!confirm('¿Eliminar este tipo de catálogo?')) return;
    this.api.delete<void>(this.sharedUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_TYPES}/${id}`).subscribe({
      next: () => {
        this.types.update((t) => t.filter((x) => x.catalogueTypeId !== id));
        if (this.selectedType()?.catalogueTypeId === id) {
          this.selectedType.set(null);
          this.values.set([]);
        }
      },
    });
  }

  createValue(): void {
    const type = this.selectedType();
    if (!type) return;
    const form = this.valueForm();
    if (!form.name.trim() || !form.code.trim()) return;
    const payload = { ...form, catalogueTypeId: type.catalogueTypeId };
    this.api.post<CatalogueValue>(this.sharedUrl, API_ENDPOINTS.SHARED.CATALOGUE_VALUES, payload).subscribe({
      next: (value) => {
        this.values.update((v) => [...v, value]);
        this.valueForm.set({ catalogueTypeId: type.catalogueTypeId, name: '', code: '', description: '' });
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
        this.values.update((v) => v.map((x) => x.catalogueValueId === value.catalogueValueId ? updated : x));
        this.cancelEditValue();
      },
    });
  }

  deleteValue(id: number): void {
    if (!confirm('¿Eliminar este valor de catálogo?')) return;
    this.api.delete<void>(this.sharedUrl, `${API_ENDPOINTS.SHARED.CATALOGUE_VALUES}/${id}`).subscribe({
      next: () => {
        this.values.update((v) => v.filter((x) => x.catalogueValueId !== id));
      },
    });
  }

  getFilteredTypes(): CatalogueType[] {
    const filter = this.typeCodeFilter().toLowerCase();
    if (!filter) return this.types();
    return this.types().filter((t) => t.name.toLowerCase().includes(filter) || t.code.toLowerCase().includes(filter));
  }
}
