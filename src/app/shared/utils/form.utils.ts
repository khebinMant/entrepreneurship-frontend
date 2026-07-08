import type { AbstractControl, ValidationErrors } from '@angular/forms';

export function getFieldError(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !control.touched) {
    return null;
  }

  const errors: ValidationErrors = control.errors;

  if (errors['required']) {
    return 'Este campo es obligatorio';
  }
  if (errors['email']) {
    return 'Correo electrónico inválido';
  }
  if (errors['minlength']) {
    return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
  }
  if (errors['maxlength']) {
    return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
  }
  if (errors['pattern']) {
    return 'Formato inválido';
  }

  return 'Campo inválido';
}

export function markAllAsTouched(control: AbstractControl): void {
  control.markAllAsTouched();
  if (control instanceof Object && 'controls' in control) {
    const group = control as unknown as { controls: Record<string, AbstractControl> };
    Object.values(group.controls).forEach((c) => markAllAsTouched(c));
  }
}
