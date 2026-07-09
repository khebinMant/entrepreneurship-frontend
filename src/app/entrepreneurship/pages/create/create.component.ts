import { Component, inject, OnInit, output, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { UserService } from '../../../user/services/user.service';
import { ENTITY_TYPE } from '../../../core/constants/app.constants';
import { Category } from '../../models/category';

@Component({
  selector: 'app-entrepreneurship-create',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
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

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly logoFile = signal<File | null>(null);
  readonly logoPreview = signal<string | null>(null);

  form = signal({
    name: '',
    description: '',
    categoryId: null as number | null,
    isPhysical: false,
    isDigital: false,
  });

  readonly user = signal<{ userId: number } | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadUser();
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

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.logoFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.logoPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoFile.set(null);
    this.logoPreview.set(null);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    const f = this.form();
    if (!f.name || !f.description || !f.categoryId) return;

    this.loading.set(true);
    try {
      const entrepreneurship = await lastValueFrom(this.entrepreneurshipService.create({
        userId: this.user()?.userId ?? 0,
        categoryId: f.categoryId,
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
          this.user()?.userId,
        ));
      }

      this.created.emit();
      this.router.navigate(['/app/entrepreneurships', entrepreneurship.entrepreneurshipId]);
    } catch (err: any) {
      console.error('Error creating entrepreneurship:', err);
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.cancelled.emit();
    this.router.navigate(['/app/entrepreneurships']);
  }
}
