import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  template: `
    @let c = control();
    @if (c.invalid && (c.touched || c.dirty)) {
      <p class="field-error" role="alert">{{ message() }}</p>
    }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  readonly label = input('This field');

  protected message(): string {
    const e = this.control().errors ?? {};
    if (e['required']) return `${this.label()} is required.`;
    if (e['email']) return 'Enter a valid email address.';
    if (e['minlength']) return `${this.label()} must be at least ${e['minlength'].requiredLength} characters.`;
    if (e['maxlength']) return `${this.label()} must be at most ${e['maxlength'].requiredLength} characters.`;
    if (e['pattern']) return e['pattern'].requiredPattern?.includes('01[0125]') ? 'Enter a valid Egyptian phone number (e.g. 01012345678).' : `${this.label()} is not in a valid format.`;
    if (e['mismatch']) return 'Passwords do not match.';
    return `${this.label()} is invalid.`;
  }
}
