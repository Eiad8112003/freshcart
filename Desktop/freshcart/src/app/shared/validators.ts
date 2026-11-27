import { AbstractControl, ValidationErrors } from '@angular/forms';

export const EGYPT_PHONE = /^01[0125][0-9]{8}$/;

/** Group validator: marks `confirm` as mismatched when it differs from `password`. */
export function passwordsMatch(passwordKey = 'password', confirmKey = 'rePassword') {
  return (group: AbstractControl): ValidationErrors | null => {
    const confirm = group.get(confirmKey);
    if (!confirm) return null;
    const mismatch = group.get(passwordKey)?.value !== confirm.value;
    if (mismatch) confirm.setErrors({ ...(confirm.errors ?? {}), mismatch: true });
    else if (confirm.hasError('mismatch')) {
      const { mismatch: _m, ...rest } = confirm.errors ?? {};
      confirm.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}
