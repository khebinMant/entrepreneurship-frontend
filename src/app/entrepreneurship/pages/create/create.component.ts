import { Component, inject, input, OnInit, output, signal, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { UserService } from '../../../user/services/user.service';
import { ENTITY_TYPE } from '../../../core/constants/app.constants';
import { Category } from '../../models/category';
import { Entrepreneurship } from '../../models/entrepreneurship';
import { ImageGallery } from '../../../shared-domain/models/image-gallery';

const MAX_IMAGES = 20;

@Component({
  selector: 'app-entrepreneurship-create',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  private readonly imageService = inject(ImageService);
  private readonly authService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly created = output<void>();
  readonly cancelled = output<void>();
  readonly editingEntrepreneurship = input<Entrepreneurship | null>(null);

  readonly isEditMode = computed(() => !!this.editingEntrepreneurship());

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly logoFile = signal<File | null>(null);
  readonly logoPreview = signal<string | null>(null);
  readonly touched = signal<Record<string, boolean>>({});
  readonly existingImages = signal<ImageGallery[]>([]);
  readonly imagesLoading = signal(false);
  readonly uploadingImage = signal(false);

  form = signal({
    name: '',
    description: '',
    categoryId: null as number | null,
    isPhysical: false,
    isDigital: false,
  });

  readonly user = signal<{ userId: number } | null>(null);

  readonly errors = computed(() => {
    const f = this.form();
    const t = this.touched();
    const s = this.submitted();
    const show = (field: string) => t[field] || s;

    return {
      name: show('name')
        ? !f.name ? 'El nombre es obligatorio'
        : f.name.length > 150 ? 'El nombre no puede exceder 150 caracteres'
        : '' : '',
      description: show('description') && !f.description ? 'La descripción es obligatoria' : '',
      categoryId: show('categoryId') && !f.categoryId ? 'La categoría es obligatoria' : '',
      logo: show('logo') && !this.isEditMode() && !this.logoFile() ? 'El logo es obligatorio' : '',
    };
  });

  readonly isValid = computed(() => {
    const f = this.form();
    const base = !!(f.name && f.name.length <= 150 && f.description && f.categoryId);
    if (this.isEditMode()) return base;
    return base && !!this.logoFile();
  });

  readonly maxImages = MAX_IMAGES;
  readonly canAddMoreImages = computed(() => this.existingImages().length < MAX_IMAGES);

  ngOnInit(): void {
    this.loadCategories();
    this.loadUser();
    const editing = this.editingEntrepreneurship();
    if (editing) {
      this.populateForm(editing);
      this.loadExistingImages(editing.entrepreneurshipId);
    }
  }

  private populateForm(e: Entrepreneurship): void {
    this.form.set({
      name: e.name || '',
      description: e.description || '',
      categoryId: e.categoryId || null,
      isPhysical: e.isPhysical,
      isDigital: e.isDigital,
    });
  }

  loadCategories(): void {
    this.entrepreneurshipService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  loadUser(): void {
    const keycloakId = this.authService.authState().keycloakId;
    if (keycloakId) {
      this.userService.getByKeycloakId(keycloakId).subscribe({
        next: (user) => this.user.set(user),
      });
    }
  }

  private loadExistingImages(entrepreneurshipId: number): void {
    this.imagesLoading.set(true);
    this.imageService.list('ENTREPRENEURSHIP', entrepreneurshipId).subscribe({
      next: (images) => {
        this.existingImages.set(images);
        this.imagesLoading.set(false);
      },
      error: () => this.imagesLoading.set(false),
    });
  }

  markTouched(field: string): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  onLogoSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.logoFile.set(file);
      this.markTouched('logo');
      const reader = new FileReader();
      reader.onload = () => this.logoPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoFile.set(null);
    this.logoPreview.set(null);
  }

  onGalleryImageSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadGalleryImage(file);
    input.value = '';
  }

  private async uploadGalleryImage(file: File): Promise<void> {
    const entrepreneurshipId = this.editingEntrepreneurship()?.entrepreneurshipId;
    if (!entrepreneurshipId) return;
    this.uploadingImage.set(true);
    try {
      await lastValueFrom(this.imageService.upload(
        file,
        'ENTREPRENEURSHIP',
        entrepreneurshipId,
        this.existingImages().length + 1,
        file.name,
        this.user()?.userId,
      ));
      this.loadExistingImages(entrepreneurshipId);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      this.uploadingImage.set(false);
    }
  }

  deleteImage(imageId: number): void {
    const entrepreneurshipId = this.editingEntrepreneurship()?.entrepreneurshipId;
    if (!entrepreneurshipId) return;
    this.imageService.delete(imageId, 'ENTREPRENEURSHIP', entrepreneurshipId).subscribe({
      next: () => this.loadExistingImages(entrepreneurshipId),
      error: (err) => console.error('Error deleting image:', err),
    });
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    const allFields = this.isEditMode()
      ? ['name', 'description', 'categoryId']
      : ['name', 'description', 'categoryId', 'logo'];
    this.touched.update(t => {
      const updated = { ...t };
      for (const field of allFields) updated[field] = true;
      return updated;
    });
    if (!this.isValid()) return;

    this.loading.set(true);
    const f = this.form();
    const currentUser = this.user();
    try {
      if (this.isEditMode()) {
        const entrepreneurship = this.editingEntrepreneurship()!;
        await lastValueFrom(this.entrepreneurshipService.update(entrepreneurship.entrepreneurshipId, {
          userId: currentUser!.userId,
          name: f.name,
          description: f.description,
          categoryId: f.categoryId!,
          isPhysical: f.isPhysical,
          isDigital: f.isDigital,
        }));

        if (this.logoFile()) {
          await lastValueFrom(this.imageService.upload(
            this.logoFile()!,
            ENTITY_TYPE.ENTREPRENEURSHIP,
            entrepreneurship.entrepreneurshipId,
            0,
            'Logo de ' + entrepreneurship.name,
            currentUser?.userId,
          ));
        }

        this.created.emit();
        this.router.navigate(['/app/entrepreneurships', entrepreneurship.entrepreneurshipId]);
      } else {
        const entrepreneurship = await lastValueFrom(this.entrepreneurshipService.create({
          userId: currentUser?.userId ?? 0,
          categoryId: f.categoryId!,
          name: f.name,
          description: f.description,
          isPhysical: f.isPhysical,
          isDigital: f.isDigital,
        }));

        if (this.logoFile()) {
          await lastValueFrom(this.imageService.upload(
            this.logoFile()!,
            ENTITY_TYPE.ENTREPRENEURSHIP,
            entrepreneurship.entrepreneurshipId,
            0,
            'Logo de ' + entrepreneurship.name,
            currentUser?.userId,
          ));
        }

        this.created.emit();
        this.router.navigate(['/app/entrepreneurships', entrepreneurship.entrepreneurshipId]);
      }
    } catch (err: any) {
      console.error('Error saving entrepreneurship:', err);
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.cancelled.emit();
    this.router.navigate(['/app/entrepreneurships']);
  }
}
