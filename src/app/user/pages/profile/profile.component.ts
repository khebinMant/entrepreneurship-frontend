import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { UserService } from '../../services/user.service';
import { CatalogueService } from '../../../shared-domain/services/catalogue.service';
import { ImageService } from '../../../shared-domain/services/image.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { KeycloakService } from '../../../authentication/services/keycloak.service';
import { ENTITY_TYPE, CATALOGUE_CODES } from '../../../core/constants/app.constants';
import type { User } from '../../models/user';
import type { ImageGallery } from '../../../shared-domain/models/image-gallery';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import type { UserAddress, CreateUserAddressDto, UpdateUserAddressDto } from '../../models/user-address';
import type { UserContact, CreateUserContactDto, UpdateUserContactDto } from '../../models/user-contact';
import type { UserIdentification, CreateUserIdentificationDto, UpdateUserIdentificationDto } from '../../models/user-identification';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly catalogueService = inject(CatalogueService);
  private readonly keycloakService = inject(KeycloakService);
  readonly imageService = inject(ImageService);

  readonly activeTab = signal<'info' | 'password' | 'addresses' | 'contacts' | 'identifications'>('info');

  // --- Profile state ---
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
  editEmail = '';

  // --- Password state ---
  newPassword = '';
  repeatPassword = '';
  readonly changingPassword = signal(false);

  // --- Email change state ---
  readonly showEmailConfirmModal = signal(false);
  readonly pendingEmail = signal('');
  readonly emailChanging = signal(false);

  // --- Addresses state ---
  readonly addresses = signal<UserAddress[]>([]);
  readonly addressesLoading = signal(false);
  readonly showAddressModal = signal(false);
  readonly editingAddress = signal<UserAddress | null>(null);
  readonly savingAddress = signal(false);
  readonly deletingAddressId = signal<number | null>(null);
  readonly addressCountries = signal<CatalogueValue[]>([]);
  readonly addressProvinces = signal<CatalogueValue[]>([]);
  readonly addressCities = signal<CatalogueValue[]>([]);
  readonly addressParishes = signal<CatalogueValue[]>([]);
  readonly addressForm = signal({
    countryId: null as number | null,
    provinceId: null as number | null,
    cityId: null as number | null,
    parishId: null as number | null,
    addressLine: '',
    reference: '',
    isPrimary: false,
  });
  readonly addressTouched = signal<Record<string, boolean>>({});
  readonly addressLineError = computed(() => {
    if (!this.addressTouched()['addressLine']) return '';
    const v = this.addressForm().addressLine.trim();
    if (!v) return 'La dirección es obligatoria';
    if (v.length < 5) return 'Debe tener al menos 5 caracteres';
    return '';
  });

  // --- Contacts state ---
  readonly contacts = signal<UserContact[]>([]);
  readonly contactsLoading = signal(false);
  readonly showContactModal = signal(false);
  readonly editingContact = signal<UserContact | null>(null);
  readonly savingContact = signal(false);
  readonly deletingContactId = signal<number | null>(null);
  readonly contactTypes = signal<CatalogueValue[]>([]);
  readonly contactForm = signal({
    contactTypeId: null as number | null,
    contactValue: '',
    isPrimary: false,
  });
  readonly contactTouched = signal<Record<string, boolean>>({});
  readonly contactTypeError = computed(() => {
    if (!this.contactTouched()['contactTypeId']) return '';
    return this.contactForm().contactTypeId ? '' : 'Selecciona un tipo de contacto';
  });
  readonly contactValueError = computed(() => {
    const f = this.contactForm();
    if (!this.contactTouched()['contactValue']) return '';
    const v = f.contactValue.trim();
    if (!v) return 'El valor del contacto es obligatorio';
    const code = this.getContactTypeCode(f.contactTypeId);
    if (this.isEmailType(code)) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingresa un correo electrónico válido';
    } else if (this.isPhoneType(code)) {
      if (!/^[\d\s+\-()]{7,20}$/.test(v)) return 'Ingresa un número de teléfono válido';
    }
    return '';
  });

  // --- Identifications state ---
  readonly identifications = signal<UserIdentification[]>([]);
  readonly identificationsLoading = signal(false);
  readonly showIdentificationModal = signal(false);
  readonly editingIdentification = signal<UserIdentification | null>(null);
  readonly savingIdentification = signal(false);
  readonly deletingIdentificationId = signal<number | null>(null);
  readonly identificationTypes = signal<CatalogueValue[]>([]);
  readonly idCountries = signal<CatalogueValue[]>([]);
  readonly identificationForm = signal({
    identificationTypeId: null as number | null,
    identificationNumber: '',
    issuedCountryId: null as number | null,
  });
  readonly identificationTouched = signal<Record<string, boolean>>({});
  readonly idNumberError = computed(() => {
    const f = this.identificationForm();
    if (!this.identificationTouched()['identificationNumber']) return '';
    const v = f.identificationNumber.trim();
    if (!v) return '';
    return this.validateIdentification(this.getIdentificationCode(f.identificationTypeId), v);
  });

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
      this.editEmail = this.authService.authState().email || u.email || '';
      this.loadImages(u.userId);
      this.loadAddresses(u.userId);
      this.loadContacts(u.userId);
      this.loadIdentifications(u.userId);
      this.loadCatalogues();
    } catch {
      this.error.set('Error al cargar tu perfil');
    } finally {
      this.loading.set(false);
    }
  }

  private loadCatalogues(): void {
    this.catalogueService.getValuesByType(CATALOGUE_CODES.CONTACT_TYPE).subscribe({
      next: (types) => this.contactTypes.set(types),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.IDENTIFICATION_TYPE).subscribe({
      next: (types) => this.identificationTypes.set(types),
    });
    this.catalogueService.getValuesByType(CATALOGUE_CODES.COUNTRY).subscribe({
      next: (countries) => {
        this.addressCountries.set(countries);
        this.idCountries.set(countries);
      },
    });
  }

  // ===================== Profile Edit =====================

  async saveProfile(): Promise<void> {
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
      this.user.update((prev) => prev ? { ...prev, ...updated } : updated);
      this.success.set('Perfil actualizado correctamente');
    } catch {
      this.error.set('Error al actualizar el perfil');
    } finally {
      this.saving.set(false);
    }

    const newEmail = this.editEmail.trim().toLowerCase();
    const oldEmail = (this.authService.authState().email || '').toLowerCase();
    if (newEmail && newEmail !== oldEmail) {
      this.pendingEmail.set(newEmail);
      this.showEmailConfirmModal.set(true);
    }
  }

  cancelEmailChange(): void {
    this.showEmailConfirmModal.set(false);
    this.pendingEmail.set('');
  }

  async confirmEmailChange(): Promise<void> {
    const u = this.user();
    const email = this.pendingEmail();
    if (!u || !email) return;
    this.emailChanging.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await lastValueFrom(this.userService.updateEmail(u.userId, email));
      this.showEmailConfirmModal.set(false);
      this.success.set('Correo electrónico cambiado con éxito. Serás redirigido para iniciar sesión nuevamente.');
      setTimeout(() => this.keycloakService.logout(), 3000);
    } catch {
      this.error.set('Error al cambiar el correo electrónico');
      this.showEmailConfirmModal.set(false);
      this.pendingEmail.set('');
    } finally {
      this.emailChanging.set(false);
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

  // ===================== Change Password =====================

  async changePassword(): Promise<void> {
    const u = this.user();
    if (!u) return;
    const pw = this.newPassword.trim();
    const rpw = this.repeatPassword.trim();
    if (!pw || pw.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (pw !== rpw) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }
    this.changingPassword.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await lastValueFrom(this.userService.changePassword(u.userId, { newPassword: pw }));
      this.success.set('Contraseña actualizada correctamente');
      this.newPassword = '';
      this.repeatPassword = '';
    } catch {
      this.error.set('Error al cambiar la contraseña');
    } finally {
      this.changingPassword.set(false);
    }
  }

  // ===================== Addresses =====================

  private async loadAddresses(userId: number): Promise<void> {
    this.addressesLoading.set(true);
    try {
      const list = await lastValueFrom(this.userService.getAddressesByUser(userId));
      this.addresses.set(list);
    } catch {
      // silent
    } finally {
      this.addressesLoading.set(false);
    }
  }

  openCreateAddress(): void {
    this.editingAddress.set(null);
    this.addressForm.set({ countryId: null, provinceId: null, cityId: null, parishId: null, addressLine: '', reference: '', isPrimary: false });
    this.addressTouched.set({});
    this.addressProvinces.set([]);
    this.addressCities.set([]);
    this.addressParishes.set([]);
    this.showAddressModal.set(true);
  }

  openEditAddress(address: UserAddress): void {
    this.editingAddress.set(address);
    this.addressForm.set({
      countryId: address.countryId,
      provinceId: address.provinceId,
      cityId: address.cityId,
      parishId: address.parishId ?? null,
      addressLine: address.addressLine,
      reference: address.reference ?? '',
      isPrimary: address.isPrimary,
    });
    this.addressTouched.set({});
    this.loadAddressProvinces(address.countryId, address.provinceId);
    this.loadAddressCities(address.provinceId, address.cityId);
    if (address.parishId) {
      this.loadAddressParishes(address.cityId);
    }
    this.showAddressModal.set(true);
  }

  closeAddressModal(): void {
    this.showAddressModal.set(false);
    this.editingAddress.set(null);
  }

  onAddressCountryChange(): void {
    this.addressForm.update((f) => ({ ...f, provinceId: null, cityId: null, parishId: null }));
    this.addressProvinces.set([]);
    this.addressCities.set([]);
    this.addressParishes.set([]);
    const countryId = this.addressForm().countryId;
    if (countryId) this.loadAddressProvinces(countryId);
  }

  onAddressProvinceChange(): void {
    this.addressForm.update((f) => ({ ...f, cityId: null, parishId: null }));
    this.addressCities.set([]);
    this.addressParishes.set([]);
    const provinceId = this.addressForm().provinceId;
    if (provinceId) this.loadAddressCities(provinceId);
  }

  onAddressCityChange(): void {
    this.addressForm.update((f) => ({ ...f, parishId: null }));
    this.addressParishes.set([]);
    const cityId = this.addressForm().cityId;
    if (cityId) this.loadAddressParishes(cityId);
  }

  private loadAddressProvinces(countryId: number, selectedProvinceId?: number): void {
    this.catalogueService.getValueChildren(countryId).subscribe({
      next: (provinces) => {
        this.addressProvinces.set(provinces);
        if (selectedProvinceId) this.loadAddressCities(selectedProvinceId);
      },
    });
  }

  private loadAddressCities(provinceId: number, selectedCityId?: number): void {
    this.catalogueService.getValueChildren(provinceId).subscribe({
      next: (cities) => {
        this.addressCities.set(cities);
      },
    });
  }

  private loadAddressParishes(cityId: number): void {
    this.catalogueService.getValueChildren(cityId).subscribe({
      next: (parishes) => this.addressParishes.set(parishes),
    });
  }

  async saveAddress(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.addressTouched.set({ addressLine: true, countryId: true, provinceId: true, cityId: true });
    const f = this.addressForm();
    if (!f.countryId || !f.provinceId || !f.cityId || !f.addressLine.trim()) {
      return;
    }
    if (this.addressLineError()) {
      return;
    }
    this.savingAddress.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const editing = this.editingAddress();
      if (editing) {
        const dto: UpdateUserAddressDto = {
          userId: u.userId,
          countryId: f.countryId,
          provinceId: f.provinceId,
          cityId: f.cityId,
          parishId: f.parishId ?? undefined,
          addressLine: f.addressLine.trim(),
          reference: f.reference.trim() || undefined,
          isPrimary: f.isPrimary,
        };
        await lastValueFrom(this.userService.updateAddress(editing.userAddressId, dto));
      } else {
        const dto: CreateUserAddressDto = {
          userId: u.userId,
          countryId: f.countryId,
          provinceId: f.provinceId,
          cityId: f.cityId,
          parishId: f.parishId ?? undefined,
          addressLine: f.addressLine.trim(),
          reference: f.reference.trim() || undefined,
          isPrimary: f.isPrimary,
        };
        await lastValueFrom(this.userService.createAddress(dto));
      }
      await this.loadAddresses(u.userId);
      this.closeAddressModal();
      this.success.set(editing ? 'Dirección actualizada' : 'Dirección creada');
    } catch {
      this.error.set('Error al guardar la dirección');
    } finally {
      this.savingAddress.set(false);
    }
  }

  async deleteAddress(id: number): Promise<void> {
    this.deletingAddressId.set(null);
    this.error.set('');
    this.success.set('');
    try {
      await lastValueFrom(this.userService.deleteAddress(id));
      this.addresses.update((list) => list.filter((a) => a.userAddressId !== id));
      this.success.set('Dirección eliminada');
    } catch {
      this.error.set('Error al eliminar la dirección');
    }
  }

  // ===================== Contacts =====================

  private async loadContacts(userId: number): Promise<void> {
    this.contactsLoading.set(true);
    try {
      const list = await lastValueFrom(this.userService.getContactsByUser(userId));
      this.contacts.set(list);
    } catch {
      // silent
    } finally {
      this.contactsLoading.set(false);
    }
  }

  openCreateContact(): void {
    this.editingContact.set(null);
    this.contactForm.set({ contactTypeId: null, contactValue: '', isPrimary: false });
    this.contactTouched.set({});
    this.showContactModal.set(true);
  }

  openEditContact(contact: UserContact): void {
    this.editingContact.set(contact);
    this.contactForm.set({
      contactTypeId: contact.contactTypeId,
      contactValue: contact.contactValue,
      isPrimary: contact.isPrimary,
    });
    this.contactTouched.set({});
    this.showContactModal.set(true);
  }

  closeContactModal(): void {
    this.showContactModal.set(false);
    this.editingContact.set(null);
  }

  async saveContact(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.contactTouched.set({ contactTypeId: true, contactValue: true, isPrimary: true });
    const f = this.contactForm();
    if (!f.contactTypeId || !f.contactValue.trim()) {
      return;
    }
    if (this.contactTypeError() || this.contactValueError()) {
      return;
    }
    this.savingContact.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const editing = this.editingContact();
      if (editing) {
        const dto: UpdateUserContactDto = {
          userId: u.userId,
          contactTypeId: f.contactTypeId,
          contactValue: f.contactValue.trim(),
          isPrimary: editing.isPrimary,
        };
        await lastValueFrom(this.userService.updateContact(editing.userContactId, dto));
      } else {
        const dto: CreateUserContactDto = {
          userId: u.userId,
          contactTypeId: f.contactTypeId,
          contactValue: f.contactValue.trim(),
          isPrimary: false,
        };
        await lastValueFrom(this.userService.createContact(dto));
      }
      await this.loadContacts(u.userId);
      this.closeContactModal();
      this.success.set(editing ? 'Contacto actualizado' : 'Contacto creado');
    } catch {
      this.error.set('Error al guardar el contacto');
    } finally {
      this.savingContact.set(false);
    }
  }

  async deleteContact(id: number): Promise<void> {
    this.deletingContactId.set(null);
    this.error.set('');
    this.success.set('');
    try {
      await lastValueFrom(this.userService.deleteContact(id));
      this.contacts.update((list) => list.filter((c) => c.userContactId !== id));
      this.success.set('Contacto eliminado');
    } catch {
      this.error.set('Error al eliminar el contacto');
    }
  }

  // ===================== Identifications =====================

  private async loadIdentifications(userId: number): Promise<void> {
    this.identificationsLoading.set(true);
    try {
      const list = await lastValueFrom(this.userService.getIdentificationsByUser(userId));
      this.identifications.set(list);
    } catch {
      // silent
    } finally {
      this.identificationsLoading.set(false);
    }
  }

  openCreateIdentification(): void {
    this.editingIdentification.set(null);
    this.identificationForm.set({ identificationTypeId: null, identificationNumber: '', issuedCountryId: null });
    this.identificationTouched.set({});
    this.showIdentificationModal.set(true);
  }

  openEditIdentification(item: UserIdentification): void {
    this.editingIdentification.set(item);
    this.identificationForm.set({
      identificationTypeId: item.identificationTypeId,
      identificationNumber: item.identificationNumber,
      issuedCountryId: item.issuedCountryId ?? null,
    });
    this.identificationTouched.set({});
    this.showIdentificationModal.set(true);
  }

  closeIdentificationModal(): void {
    this.showIdentificationModal.set(false);
    this.editingIdentification.set(null);
  }

  async saveIdentification(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.identificationTouched.set({ identificationTypeId: true, identificationNumber: true, issuedCountryId: true });
    const f = this.identificationForm();
    if (!f.identificationTypeId || !f.identificationNumber.trim()) {
      return;
    }
    if (this.idNumberError()) {
      return;
    }
    this.savingIdentification.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const editing = this.editingIdentification();
      if (editing) {
        const dto: UpdateUserIdentificationDto = {
          userId: u.userId,
          identificationTypeId: f.identificationTypeId,
          identificationNumber: f.identificationNumber.trim(),
          issuedCountryId: f.issuedCountryId ?? undefined,
        };
        await lastValueFrom(this.userService.updateIdentification(editing.userIdentificationId, dto));
      } else {
        const dto: CreateUserIdentificationDto = {
          userId: u.userId,
          identificationTypeId: f.identificationTypeId,
          identificationNumber: f.identificationNumber.trim(),
          issuedCountryId: f.issuedCountryId ?? undefined,
        };
        await lastValueFrom(this.userService.createIdentification(dto));
      }
      await this.loadIdentifications(u.userId);
      this.closeIdentificationModal();
      this.success.set(editing ? 'Identificación actualizada' : 'Identificación creada');
    } catch {
      this.error.set('Error al guardar la identificación');
    } finally {
      this.savingIdentification.set(false);
    }
  }

  async deleteIdentification(id: number): Promise<void> {
    this.deletingIdentificationId.set(null);
    this.error.set('');
    this.success.set('');
    try {
      await lastValueFrom(this.userService.deleteIdentification(id));
      this.identifications.update((list) => list.filter((i) => i.userIdentificationId !== id));
      this.success.set('Identificación eliminada');
    } catch {
      this.error.set('Error al eliminar la identificación');
    }
  }

  // ===================== Utils =====================

  trackById(_index: number, item: { imageId: number }): number {
    return item.imageId;
  }

  getContactTypeName(typeId: number): string {
    return this.contactTypes().find((t) => t.catalogueValueId === typeId)?.name ?? '';
  }

  getContactTypeCode(typeId: number | null): string {
    if (typeId == null) return '';
    return this.contactTypes().find((t) => t.catalogueValueId === typeId)?.code?.toUpperCase() ?? '';
  }

  isEmailType(code: string): boolean {
    return code.includes('EMAIL') || code.includes('CORREO');
  }

  isPhoneType(code: string): boolean {
    return code.includes('PHONE') || code.includes('TEL') || code.includes('CEL') || code.includes('MOVIL') || code.includes('WHATSAPP');
  }

  getIdentificationTypeName(typeId: number | null): string {
    return this.getIdentificationDisplayName(
      this.identificationTypes().find((t) => t.catalogueValueId === typeId),
    );
  }

  getIdentificationDisplayName(item: CatalogueValue | undefined): string {
    if (!item) return '';
    const code = item.code?.toUpperCase() ?? '';
    if (code.includes('CED') || code.includes('CÉD')) return 'Cédula';
    if (code.includes('PASS')) return 'Pasaporte';
    if (code === 'RUC') return 'RUC';
    return item.name;
  }

  getIdentificationCode(typeId: number | null): string {
    if (typeId == null) return '';
    return this.identificationTypes().find((t) => t.catalogueValueId === typeId)?.code?.toUpperCase() ?? '';
  }

  validateIdentification(code: string, value: string): string {
    if (code.includes('CED') || code.includes('CÉD')) return this.validateCedula(value);
    if (code === 'RUC') return this.validateRuc(value);
    if (code.includes('PASS')) return this.validatePassport(value);
    if (!value) return 'El valor no puede estar vacío';
    return '';
  }

  private validateCedula(value: string): string {
    if (!/^\d{10}$/.test(value)) return 'La cédula debe tener exactamente 10 dígitos';
    const provincia = parseInt(value.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return 'Los dígitos de provincia no son válidos (01-24)';
    const tercerDigito = parseInt(value[2], 10);
    if (tercerDigito > 5) return 'El tercer dígito debe ser menor a 6';
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let producto = parseInt(value[i], 10) * coeficientes[i];
      if (producto >= 10) producto -= 9;
      suma += producto;
    }
    const digitoVerificador = parseInt(value[9], 10);
    const residuo = suma % 10;
    const esperado = residuo === 0 ? 0 : 10 - residuo;
    if (digitoVerificador !== esperado) return 'El dígito verificador de la cédula no es válido';
    return '';
  }

  private validateRuc(value: string): string {
    if (!/^\d{13}$/.test(value)) return 'El RUC debe tener exactamente 13 dígitos';
    const cedula = value.substring(0, 10);
    const errorCedula = this.validateCedula(cedula);
    if (errorCedula) return 'El RUC no es válido: ' + errorCedula;
    const ultimosTres = value.substring(10);
    if (ultimosTres === '000') return 'Los últimos 3 dígitos del RUC no pueden ser 000';
    return '';
  }

  private validatePassport(value: string): string {
    if (value.length < 5) return 'El pasaporte debe tener al menos 5 caracteres';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'El pasaporte solo puede contener letras y números';
    return '';
  }

  markIdTouched(field: string): void {
    this.identificationTouched.update((t) => ({ ...t, [field]: true }));
  }

  onIdFieldChange(field: string, value: unknown): void {
    this.identificationForm.update((f) => ({ ...f, [field]: value }));
  }

  markAddrTouched(field: string): void {
    this.addressTouched.update((t) => ({ ...t, [field]: true }));
  }

  onAddrFieldChange(field: string, value: unknown): void {
    this.addressForm.update((f) => ({ ...f, [field]: value }));
  }

  markContactTouched(field: string): void {
    this.contactTouched.update((t) => ({ ...t, [field]: true }));
  }

  onContactFieldChange(field: string, value: unknown): void {
    this.contactForm.update((f) => ({ ...f, [field]: value }));
  }

  getCountryName(countryId: number | undefined | null): string {
    if (!countryId) return '';
    return this.addressCountries().find((c) => c.catalogueValueId === countryId)?.name ?? '';
  }
}
