import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { FieldError } from '../../shared/ui/field-error';
import { AuthShell } from './auth-shell';
import { ResetFlowService } from './reset-flow.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, FieldError],
  template: `
    <app-auth-shell heading="Forgot Password?" subheading="Enter your email and we’ll send you a 6-digit reset code" [hero]="false">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
        <div>
          <label for="email" class="mb-1 block text-sm font-semibold">Email Address</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" class="field" placeholder="Enter your email">
          <app-field-error [control]="form.controls.email" label="Email" />
        </div>
        @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{{ error() }}</p> }
        <button class="btn-primary w-full !py-3.5" [disabled]="loading()">
          @if (loading()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Sending... } @else { Send Reset Code }
        </button>
      </form>
      <p class="mt-6 text-center text-sm"><a routerLink="/login" class="font-semibold text-primary-600 hover:underline"><i class="fa-solid fa-arrow-left mr-1"></i>Back to sign in</a></p>
    </app-auth-shell>
  `,
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly flow = inject(ResetFlowService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  protected submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.auth.forgotPassword(email).subscribe({
      next: () => { this.flow.start(email); this.toast.success('Reset code sent to your email'); void this.router.navigate(['/verify-code']); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
