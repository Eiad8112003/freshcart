import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { FieldError } from '../../shared/ui/field-error';
import { AuthShell } from './auth-shell';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, FieldError],
  template: `
    <app-auth-shell heading="Welcome Back!" subheading="Sign in to continue your fresh shopping experience">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
        <div>
          <label for="email" class="mb-1 block text-sm font-semibold">Email Address</label>
          <div class="relative">
            <i class="fa-solid fa-envelope pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input id="email" type="email" formControlName="email" autocomplete="email" class="field pl-11" placeholder="Enter your email">
          </div>
          <app-field-error [control]="form.controls.email" label="Email" />
        </div>
        <div>
          <div class="mb-1 flex items-center justify-between">
            <label for="password" class="text-sm font-semibold">Password</label>
            <a routerLink="/forgot-password" class="text-sm font-medium text-primary-600 hover:underline">Forgot Password?</a>
          </div>
          <div class="relative">
            <i class="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input id="password" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" class="field pl-11 pr-12" placeholder="Enter your password">
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-ink" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'">
              <i class="fa-regular" [class]="show() ? 'fa-eye-slash' : 'fa-eye'"></i>
            </button>
          </div>
          <app-field-error [control]="form.controls.password" label="Password" />
        </div>
        @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{{ error() }}</p> }
        <button class="btn-primary w-full !py-3.5" [disabled]="loading()">
          @if (loading()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Signing in... } @else { Sign In }
        </button>
      </form>
      <p class="mt-6 border-t border-gray-100 pt-5 text-center text-gray-600">New to FreshCart? <a routerLink="/signup" class="font-semibold text-primary-600 hover:underline">Create an account</a></p>
    </app-auth-shell>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly show = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.signIn(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
      },
      error: e => { this.error.set(errorMessage(e, 'Incorrect email or password.')); this.loading.set(false); },
    });
  }
}
