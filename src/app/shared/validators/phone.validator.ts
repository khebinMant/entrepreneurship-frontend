import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const cleaned = value.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+\d{7,15}$|^\d{7,15}$/;
    return phoneRegex.test(cleaned) ? null : { invalidPhone: true };
  };
}
