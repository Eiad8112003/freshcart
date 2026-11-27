import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { FieldError } from '../../shared/ui/field-error';
import { EGYPT_PHONE, passwordsMatch } from '../../shared/validators';
import { AuthShell } from './auth-shell';

@Component({
  selector: 'app-signup-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, FieldError],
  template: `
    <app-auth-shell heading="Create Your Account" subheading="Start your fresh journey with us today">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
        <div>
          <label for="name" class="mb-1 block text-sm font-semibold">Name</label>
          <input id="name" formControlName="name" autocomplete="name" class="field" placeholder="Your full name">
          <app-field-error [control]="form.controls.name" label="Name" />
        </div>
        <div>
          <label for="email" class="mb-1 block text-sm font-semibold">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" class="field" placeholder="you@example.com">
          <app-field-error [control]="form.controls.email" label="Email" />
        </div>
        <div>
          <label for="phone" class="mb-1 block text-sm font-semibold">Phone</label>
          <input id="phone" type="tel" formControlName="phone" autocomplete="tel" class="field" placeholder="01xxxxxxxxx">
          <app-field-error [control]="form.controls.phone" label="Phone" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="password" class="mb-1 block text-sm font-semibold">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" class="field" placeholder="At least 6 characters">
            <app-field-error [control]="form.controls.password" label="Password" />
          </div>
          <div>
            <label for="rePassword" class="mb-1 block text-sm font-semibold">Confirm Password</label>
            <input id="rePassword" type="password" formControlName="rePassword" autocomplete="new-password" class="field" placeholder="Repeat password">
            <app-field-error [control]="form.controls.rePassword" label="Confirmation" />
          </div>
        </div>
        <label class="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" formControlName="terms" class="mt-0.5 size-4 accent-primary-600">
          <span>I agree to the <a href="#" class="font-medium text-primary-600 hover:underline">Terms of Service</a> and <a href="#" class="font-medium text-primary-600 hover:underline">Privacy Policy</a></span>
        </label>
        @if (form.controls.terms.touched && form.controls.terms.invalid) { <p class="field-error" role="alert">You must accept the terms to continue.</p> }
        @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{{ error() }}</p> }
        <button class="btn-primary w-full !py-3.5" [disabled]="loading()">
          @if (loading()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Creating account... } @else { Create My Account }
        </button>
      </form>
      <p class="mt-6 border-t border-gray-100 pt-5 text-center text-gray-600">Already have an account? <a routerLink="/login" class="font-semibold text-primary-600 hover:underline">Sign in</a></p>
    </app-auth-shell>
  `,
})
export class SignupPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(EGYPT_PHONE)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rePassword: ['', [Validators.required]],
    terms: [false, [Validators.requiredTrue]],
  }, { validators: passwordsMatch() });

  protected submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { terms: _terms, ...payload } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.auth.signUp(payload).subscribe({
      next: () => { this.toast.success('Account created. Welcome to FreshCart!'); void this.router.navigateByUrl('/'); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
