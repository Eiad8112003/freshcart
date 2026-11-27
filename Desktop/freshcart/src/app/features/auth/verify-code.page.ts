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
  selector: 'app-verify-code-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, FieldError],
  template: `
    <app-auth-shell heading="Verify Reset Code" [subheading]="'Enter the 6-digit code we sent to ' + (flow.email() ?? 'your email')" [hero]="false">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
        <div>
          <label for="code" class="mb-1 block text-sm font-semibold">Verification Code</label>
          <input id="code" formControlName="resetCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6"
            class="field text-center text-2xl font-bold tracking-[0.5em]" placeholder="------">
          <app-field-error [control]="form.controls.resetCode" label="Code" />
        </div>
        @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{{ error() }}</p> }
        <button class="btn-primary w-full !py-3.5" [disabled]="loading()">
          @if (loading()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Verifying... } @else { Verify Code }
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-600">Didn’t get a code? <a routerLink="/forgot-password" class="font-semibold text-primary-600 hover:underline">Send again</a></p>
    </app-auth-shell>
  `,
})
export class VerifyCodePage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly flow = inject(ResetFlowService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({ resetCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] });

  constructor() {
    if (!this.flow.email()) void this.router.navigate(['/forgot-password']);
  }

  protected submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.verifyResetCode(this.form.getRawValue().resetCode).subscribe({
      next: () => { this.flow.markVerified(); this.toast.success('Code verified'); void this.router.navigate(['/reset-password']); },
      error: e => { this.error.set(errorMessage(e, 'Invalid or expired code.')); this.loading.set(false); },
    });
  }
}
