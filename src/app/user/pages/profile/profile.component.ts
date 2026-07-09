import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { UserService } from '../../services/user.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { ENTITY_TYPE } from '../../../core/constants/app.constants';
import type { User } from '../../models/user';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  readonly imageService = inject(ImageService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly images = signal<ImageGallery[]>([]);
  readonly canAddMore = signal(true);
  readonly deleteConfirmId = signal<number | null>(null);

  editFirstName = '';
  editLastName = '';

  async ngOnInit(): Promise<void> {
    const keycloakId = this.authService.authState().keycloakId;
    if (!keycloakId) return;
    await this.loadUser(keycloakId);
  }

  private async loadUser(keycloakId: string): Promise<void> {
    this.loading.set(true);
    try {
      const u = await lastValueFrom(this.userService.getByKeycloakId(keycloakId));
      this.user.set(u);
      this.editFirstName = u.firstName;
      this.editLastName = u.lastName;
      this.loadImages(u.userId);
    } catch {
      this.error.set('Error al cargar tu perfil');
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const u = this.user();
    if (!u) return;
    const firstName = this.editFirstName.trim();
    const lastName = this.editLastName.trim();
    if (!firstName || !lastName) {
      this.error.set('Nombres y apellidos son obligatorios');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const updated = await lastValueFrom(this.userService.update(u.userId, { firstName, lastName }));
      this.user.set(updated);
      this.success.set('Perfil actualizado correctamente');
    } catch {
      this.error.set('Error al actualizar el perfil');
    } finally {
      this.saving.set(false);
    }
  }

  async uploadProfilePicture(event: Event): Promise<void> {
    const u = this.user();
    if (!u) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set('');
    try {
      const result = await lastValueFrom(
        this.imageService.upload(file, ENTITY_TYPE.USER, u.userId, 0, 'Foto de perfil', u.userId),
      );
      this.authService.setUserImage(result.imageUrl);
      this.user.update((prev) => prev ? { ...prev, imageUrl: result.imageUrl, imageId: result.imageId } : prev);
      await this.loadImages(u.userId);
    } catch {
      this.error.set('Error al subir la foto');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  private async loadImages(entityId: number): Promise<void> {
    try {
      const imgs = await lastValueFrom(this.imageService.list(ENTITY_TYPE.USER, entityId));
      this.images.set(imgs);
      const canAdd = await lastValueFrom(this.imageService.canAddMore(ENTITY_TYPE.USER, entityId));
      this.canAddMore.set(canAdd);
    } catch {
      // silent
    }
  }

  async deleteImage(imageId: number): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.deleteConfirmId.set(null);
    try {
      await lastValueFrom(this.imageService.delete(imageId, ENTITY_TYPE.USER, u.userId));
      this.images.update((imgs) => imgs.filter((img) => img.imageId !== imageId));
      if (u.imageId === imageId) {
        this.authService.setUserImage(null);
        this.user.update((prev) => prev ? { ...prev, imageUrl: undefined, imageId: undefined } : prev);
      }
    } catch {
      this.error.set('Error al eliminar la imagen');
    }
  }

  async uploadGalleryImage(event: Event): Promise<void> {
    const u = this.user();
    if (!u) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set('');
    try {
      await lastValueFrom(
        this.imageService.upload(file, ENTITY_TYPE.USER, u.userId, this.images().length + 1, '', u.userId),
      );
      await this.loadImages(u.userId);
    } catch {
      this.error.set('Error al subir la imagen');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  trackById(_index: number, item: { imageId: number }): number {
    return item.imageId;
  }
}
