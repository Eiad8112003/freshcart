import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { FieldError } from '../../shared/ui/field-error';
import { PageHeader } from '../../shared/ui/page-header';
import { EGYPT_PHONE, passwordsMatch } from '../../shared/validators';
import { AccountNav } from './account-nav';

@Component({
  selector: 'app-profile-settings-page',
  imports: [ReactiveFormsModule, PageHeader, FieldError, AccountNav],
  template: `
    <div class="container-page py-8">
      <app-page-header title="Account Settings" icon="fa-gear" subtitle="Manage your profile and password" [crumbs]="[{ label: 'Profile' }]" />
      <div class="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <app-account-nav />
        <div class="space-y-6">
          <section class="card p-6" aria-labelledby="p-h">
            <h2 id="p-h" class="mb-4 text-lg font-bold">Profile information</h2>
            <form [formGroup]="profile" (ngSubmit)="saveProfile()" novalidate class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="name" class="mb-1 block text-sm font-semibold">Name</label>
                <input id="name" formControlName="name" class="field"><app-field-error [control]="profile.controls.name" label="Name" />
              </div>
              <div>
                <label for="email" class="mb-1 block text-sm font-semibold">Email</label>
                <input id="email" type="email" formControlName="email" class="field"><app-field-error [control]="profile.controls.email" label="Email" />
              </div>
              <div>
                <label for="phone" class="mb-1 block text-sm font-semibold">Phone</label>
                <input id="phone" type="tel" formControlName="phone" class="field"><app-field-error [control]="profile.controls.phone" label="Phone" />
              </div>
              <div class="sm:col-span-2"><button class="btn-primary" [disabled]="savingProfile()">{{ savingProfile() ? 'Saving...' : 'Save changes' }}</button></div>
            </form>
          </section>

          <section class="card p-6" aria-labelledby="pw-h">
            <h2 id="pw-h" class="mb-4 text-lg font-bold">Change password</h2>
            <form [formGroup]="password" (ngSubmit)="savePassword()" novalidate class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="cur" class="mb-1 block text-sm font-semibold">Current password</label>
                <input id="cur" type="password" formControlName="currentPassword" autocomplete="current-password" class="field"><app-field-error [control]="password.controls.currentPassword" label="Current password" />
              </div>
              <div>
                <label for="new" class="mb-1 block text-sm font-semibold">New password</label>
                <input id="new" type="password" formControlName="password" autocomplete="new-password" class="field"><app-field-error [control]="password.controls.password" label="New password" />
              </div>
              <div>
                <label for="re" class="mb-1 block text-sm font-semibold">Confirm new password</label>
                <input id="re" type="password" formControlName="rePassword" autocomplete="new-password" class="field"><app-field-error [control]="password.controls.rePassword" label="Confirmation" />
              </div>
              <div class="sm:col-span-2"><button class="btn-dark" [disabled]="savingPassword()">{{ savingPassword() ? 'Updating...' : 'Update password' }}</button></div>
            </form>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class ProfileSettingsPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly profile = this.fb.group({
    name: [this.auth.user()?.name ?? '', [Validators.required, Validators.minLength(3)]],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.auth.user()?.phone ?? '', [Validators.required, Validators.pattern(EGYPT_PHONE)]],
  });
  protected readonly password = this.fb.group({
    currentPassword: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rePassword: ['', Validators.required],
  }, { validators: passwordsMatch() });

  protected saveProfile() {
    if (this.profile.invalid) { this.profile.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    this.auth.updateProfile(this.profile.getRawValue()).subscribe({
      next: () => { this.savingProfile.set(false); this.toast.success('Profile updated'); },
      error: e => { this.savingProfile.set(false); this.toast.error(errorMessage(e)); },
    });
  }

  protected savePassword() {
    if (this.password.invalid) { this.password.markAllAsTouched(); return; }
    this.savingPassword.set(true);
    this.auth.changePassword(this.password.getRawValue()).subscribe({
      next: () => { this.savingPassword.set(false); this.password.reset(); this.toast.success('Password updated'); },
      error: e => { this.savingPassword.set(false); this.toast.error(errorMessage(e)); },
    });
  }
}
