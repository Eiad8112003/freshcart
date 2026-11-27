import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { FieldError } from '../../shared/ui/field-error';
import { passwordsMatch } from '../../shared/validators';
import { AuthShell } from './auth-shell';
import { ResetFlowService } from './reset-flow.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, AuthShell, FieldError],
  template: `
    <app-auth-shell heading="Reset Password" subheading="Choose a new password for your account" [hero]="false">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
        <div>
          <label for="password" class="mb-1 block text-sm font-semibold">New Password</label>
          <input id="password" type="password" formControlName="password" autocomplete="new-password" class="field" placeholder="At least 6 characters">
          <app-field-error [control]="form.controls.password" label="Password" />
        </div>
        <div>
          <label for="rePassword" class="mb-1 block text-sm font-semibold">Confirm Password</label>
          <input id="rePassword" type="password" formControlName="rePassword" autocomplete="new-password" class="field" placeholder="Repeat password">
          <app-field-error [control]="form.controls.rePassword" label="Confirmation" />
        </div>
        @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{{ error() }}</p> }
        <button class="btn-primary w-full !py-3.5" [disabled]="loading()">
          @if (loading()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Saving... } @else { Reset Password }
        </button>
      </form>
    </app-auth-shell>
  `,
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly flow = inject(ResetFlowService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    rePassword: ['', [Validators.required]],
  }, { validators: passwordsMatch() });

  constructor() {
    if (!this.flow.email() || !this.flow.verified()) void this.router.navigate(['/forgot-password']);
  }

  protected submit() {
    const email = this.flow.email();
    if (this.form.invalid || !email) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.resetPassword(email, this.form.getRawValue().password).subscribe({
      next: () => { this.flow.clear(); this.toast.success('Password updated. Please sign in.'); void this.router.navigate(['/login']); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
