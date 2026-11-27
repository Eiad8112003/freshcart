import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../core/services/address.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { EmptyState } from '../../shared/ui/empty-state';
import { FieldError } from '../../shared/ui/field-error';
import { PageHeader } from '../../shared/ui/page-header';
import { Spinner } from '../../shared/ui/spinner';
import { EGYPT_PHONE } from '../../shared/validators';
import { AccountNav } from './account-nav';

@Component({
  selector: 'app-addresses-page',
  imports: [ReactiveFormsModule, PageHeader, FieldError, AccountNav, Spinner, EmptyState],
  template: `
    <div class="container-page py-8">
      <app-page-header title="My Addresses" icon="fa-location-dot" subtitle="Manage your delivery addresses" [crumbs]="[{ label: 'Profile', link: '/profile' }, { label: 'Addresses' }]" />
      <div class="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <app-account-nav />
        <div class="space-y-6">
          <section aria-label="Saved addresses">
            @if (store.loading() && !store.addresses().length) { <app-spinner /> }
            @else if (!store.addresses().length) {
              <app-empty-state icon="fa-location-dot" title="No saved addresses" message="Add one below to speed up checkout." />
            } @else {
              <ul class="grid gap-4 sm:grid-cols-2">
                @for (a of store.addresses(); track a._id) {
                  <li class="card flex flex-col gap-1 p-5 text-sm">
                    <div class="flex items-start justify-between"><b class="text-base">{{ a.name }}</b>
                      <button class="text-gray-500 hover:text-red-600" (click)="remove(a._id)" [attr.aria-label]="'Delete ' + a.name"><i class="fa-regular fa-trash-can"></i></button></div>
                    <p class="text-gray-700">{{ a.details }}</p><p class="text-gray-600">{{ a.city }}</p>
                    <p class="text-gray-600"><i class="fa-solid fa-phone mr-1 text-xs"></i>{{ a.phone }}</p>
                  </li>
                }
              </ul>
            }
          </section>

          <section class="card p-6" aria-labelledby="add-h">
            <h2 id="add-h" class="mb-4 text-lg font-bold">Add a new address</h2>
            <form [formGroup]="form" (ngSubmit)="add()" novalidate class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="n" class="mb-1 block text-sm font-semibold">Label</label>
                <input id="n" formControlName="name" class="field" placeholder="Home, Work..."><app-field-error [control]="form.controls.name" label="Label" />
              </div>
              <div>
                <label for="c" class="mb-1 block text-sm font-semibold">City</label>
                <input id="c" formControlName="city" class="field" placeholder="Cairo"><app-field-error [control]="form.controls.city" label="City" />
              </div>
              <div class="sm:col-span-2">
                <label for="d" class="mb-1 block text-sm font-semibold">Address details</label>
                <textarea id="d" formControlName="details" rows="3" class="field" placeholder="Street, building, floor, apartment"></textarea><app-field-error [control]="form.controls.details" label="Address" />
              </div>
              <div class="sm:col-span-2">
                <label for="p" class="mb-1 block text-sm font-semibold">Phone</label>
                <input id="p" type="tel" formControlName="phone" class="field" placeholder="01xxxxxxxxx"><app-field-error [control]="form.controls.phone" label="Phone" />
              </div>
              <div class="sm:col-span-2"><button class="btn-primary" [disabled]="saving()"><i class="fa-solid fa-plus"></i>{{ saving() ? 'Saving...' : 'Add address' }}</button></div>
            </form>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class AddressesPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  protected readonly store = inject(AddressService);
  protected readonly saving = signal(false);
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', Validators.required],
    details: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required, Validators.pattern(EGYPT_PHONE)]],
  });

  constructor() { this.store.load(); }

  protected add() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.store.add(this.form.getRawValue()).subscribe({
      next: () => { this.saving.set(false); this.form.reset(); this.toast.success('Address added'); },
      error: e => { this.saving.set(false); this.toast.error(errorMessage(e)); },
    });
  }
  protected remove(id: string) {
    this.store.remove(id).subscribe({ next: () => this.toast.success('Address removed'), error: e => this.toast.error(errorMessage(e)) });
  }
}
