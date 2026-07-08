import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const dniRegex = /^\d{10}$/;
    return dniRegex.test(value) ? null : { invalidDni: true };
  };
}
