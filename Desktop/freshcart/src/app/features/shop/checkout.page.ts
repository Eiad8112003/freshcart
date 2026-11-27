import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ShippingAddress } from '../../core/models/shop.models';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { EmptyState } from '../../shared/ui/empty-state';
import { FieldError } from '../../shared/ui/field-error';
import { PageHeader } from '../../shared/ui/page-header';
import { EGYPT_PHONE } from '../../shared/validators';

type Payment = 'cash' | 'card';

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, EgpPipe, PageHeader, EmptyState, FieldError],
  template: `
    <div class="container-page pb-28 pt-8 lg:pb-8">
      <app-page-header title="Complete Your Order" icon="fa-receipt" subtitle="Review your items and complete your purchase"
        [crumbs]="[{ label: 'Cart', link: '/cart' }, { label: 'Checkout' }]" />

      @if (!cart.lines().length) {
        <app-empty-state icon="fa-cart-shopping" title="Nothing to check out" message="Your cart is empty." actionLabel="Start shopping" />
      } @else {
        <div class="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div class="space-y-6">
            <section class="card overflow-hidden" aria-labelledby="ship-h">
              <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
                <h2 id="ship-h" class="flex items-center gap-2 font-bold"><i class="fa-solid fa-house"></i>Shipping Address</h2>
                <p class="text-sm text-white/90">Where should we deliver your order?</p>
              </div>
              <div class="space-y-4 p-6">
                @if (addresses.addresses().length) {
                  <fieldset class="space-y-3">
                    <legend class="mb-1 text-sm font-semibold">Saved addresses</legend>
                    @for (a of addresses.addresses(); track a._id) {
                      <label class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition"
                        [class]="!useNew() && selectedId() === a._id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
                        <input type="radio" name="address" class="mt-1 size-4 accent-primary-600" [checked]="!useNew() && selectedId() === a._id" (change)="pick(a._id)">
                        <span class="text-sm"><b class="block">{{ a.name }}</b>{{ a.details }}, {{ a.city }}<span class="block text-gray-600"><i class="fa-solid fa-phone mr-1 text-xs"></i>{{ a.phone }}</span></span>
                      </label>
                    }
                    <label class="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 text-sm font-semibold transition"
                      [class]="useNew() ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-600'">
                      <input type="radio" name="address" class="size-4 accent-primary-600" [checked]="useNew()" (change)="useNew.set(true)">
                      <i class="fa-solid fa-plus text-primary-600"></i>Use a different address
                    </label>
                  </fieldset>
                }
                @if (useNew() || !addresses.addresses().length) {
                  <form [formGroup]="form" class="space-y-4" novalidate>
                    <div>
                      <label for="city" class="mb-1 block text-sm font-semibold">City <span class="text-red-600">*</span></label>
                      <input id="city" formControlName="city" class="field" placeholder="e.g. Cairo, Alexandria, Giza">
                      <app-field-error [control]="form.controls.city" label="City" />
                    </div>
                    <div>
                      <label for="details" class="mb-1 block text-sm font-semibold">Street Address <span class="text-red-600">*</span></label>
                      <textarea id="details" formControlName="details" rows="3" class="field" placeholder="Street name, building number, floor, apartment..."></textarea>
                      <app-field-error [control]="form.controls.details" label="Address" />
                    </div>
                    <div>
                      <label for="phone" class="mb-1 block text-sm font-semibold">Phone Number <span class="text-red-600">*</span></label>
                      <input id="phone" type="tel" formControlName="phone" class="field" placeholder="01xxxxxxxxx">
                      <app-field-error [control]="form.controls.phone" label="Phone" />
                    </div>
                  </form>
                }
              </div>
            </section>

            <section class="card overflow-hidden" aria-labelledby="pay-h">
              <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
                <h2 id="pay-h" class="flex items-center gap-2 font-bold"><i class="fa-regular fa-credit-card"></i>Payment Method</h2>
                <p class="text-sm text-white/90">Choose how you’d like to pay</p>
              </div>
              <fieldset class="space-y-3 p-6">
                <legend class="sr-only">Payment method</legend>
                @for (m of methods; track m.id) {
                  <label class="flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition" [class]="payment() === m.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
                    <input type="radio" name="payment" class="sr-only" [checked]="payment() === m.id" (change)="payment.set(m.id)">
                    <span class="grid size-12 place-items-center rounded-xl" [class]="payment() === m.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'"><i [class]="'fa-solid ' + m.icon"></i></span>
                    <span class="flex-1 text-sm"><b class="block">{{ m.title }}</b><span class="text-gray-600">{{ m.text }}</span></span>
                    <i class="fa-solid text-xl" [class]="payment() === m.id ? 'fa-circle-check text-primary-600' : 'fa-circle text-gray-300'"></i>
                  </label>
                }
                <p class="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-primary-700"><i class="fa-solid fa-shield-halved"></i>Your payment info is protected with 256-bit SSL encryption</p>
              </fieldset>
            </section>
          </div>

          <aside class="card overflow-hidden lg:sticky lg:top-24" aria-label="Order summary">
            <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
              <h2 class="flex items-center gap-2 font-bold"><i class="fa-solid fa-bag-shopping"></i>Order Summary</h2>
              <p class="text-sm text-white/90">{{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'items' }}</p>
            </div>
            <div class="space-y-4 p-6">
              <ul class="max-h-64 space-y-3 overflow-y-auto pr-1">
                @for (l of cart.lines(); track l.product._id) {
                  <li class="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <img [src]="l.product.imageCover" [alt]="l.product.title" class="size-12 rounded-lg object-cover">
                    <span class="min-w-0 flex-1 text-sm"><span class="line-clamp-2 font-medium">{{ l.product.title }}</span><span class="text-xs text-gray-600">{{ l.count }} × {{ l.price | egp }}</span></span>
                    <span class="text-sm font-bold">{{ l.count * l.price | egp }}</span>
                  </li>
                }
              </ul>
              <dl class="space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div class="flex justify-between"><dt class="text-gray-600">Subtotal</dt><dd class="font-medium">{{ cart.total() | egp }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-600">Shipping</dt><dd class="font-semibold text-primary-600">{{ cart.total() >= 500 ? 'FREE' : 'Calculated by carrier' }}</dd></div>
              </dl>
              <div class="flex items-baseline justify-between border-t border-gray-100 pt-4"><span class="font-semibold">Total</span><span class="text-2xl font-bold text-primary-600">{{ cart.total() | egp }}</span></div>
              @if (error()) { <p class="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{{ error() }}</p> }
              <button class="btn-primary hidden w-full !py-3.5 lg:inline-flex" (click)="placeOrder()" [disabled]="submitting()">
                @if (submitting()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Processing... } @else { <i class="fa-solid fa-lock"></i>Place Order }
              </button>
              <a routerLink="/cart" class="block text-center text-sm font-semibold text-primary-600 hover:underline"><i class="fa-solid fa-arrow-left mr-1"></i>Back to Cart</a>
            </div>
          </aside>
        </div>

        <!-- Sticky action bar for tablet / mobile so Place Order is always reachable -->
        <div class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
          <div class="leading-tight"><p class="text-xs text-gray-600">Total</p><p class="text-lg font-bold text-primary-600">{{ cart.total() | egp }}</p></div>
          <button class="btn-primary flex-1 !py-3.5" (click)="placeOrder()" [disabled]="submitting()">
            @if (submitting()) { <i class="fa-solid fa-circle-notch fa-spin"></i>Processing... } @else { <i class="fa-solid fa-lock"></i>Place Order }
          </button>
        </div>
      }
    </div>
  `,
})
export class CheckoutPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly orders = inject(OrderService);
  private readonly toast = inject(ToastService);
  protected readonly cart = inject(CartService);
  protected readonly addresses = inject(AddressService);

  protected readonly payment = signal<Payment>('cash');
  protected readonly useNew = signal(false);
  private readonly pickedId = signal<string | null>(null);
  protected readonly selectedId = computed(() => this.pickedId() ?? this.addresses.addresses()[0]?._id ?? null);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly methods: { id: Payment; icon: string; title: string; text: string }[] = [
    { id: 'cash', icon: 'fa-money-bill-wave', title: 'Cash on Delivery', text: 'Pay when your order arrives at your doorstep' },
    { id: 'card', icon: 'fa-credit-card', title: 'Pay Online', text: 'Secure payment with Credit/Debit Card via Stripe' },
  ];
  protected readonly form = this.fb.group({
    city: ['', Validators.required],
    details: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required, Validators.pattern(EGYPT_PHONE)]],
  });

  constructor() { this.addresses.load(); }

  protected pick(id: string) { this.pickedId.set(id); this.useNew.set(false); }

  protected placeOrder() {
    const cartId = this.cart.cartId();
    const shipping = this.resolveAddress();
    if (!cartId || !shipping) return;
    this.submitting.set(true);
    this.error.set(null);

    if (this.payment() === 'cash') {
      this.orders.placeCashOrder(cartId, shipping).subscribe({
        next: () => { this.cart.reset(); this.toast.success('Order placed successfully!'); void this.router.navigate(['/orders']); },
        error: e => this.fail(e),
      });
    } else {
      this.orders.createCardSession(cartId, shipping).subscribe({
        next: r => { window.location.href = r.session.url; },
        error: e => this.fail(e),
      });
    }
  }

  private resolveAddress(): ShippingAddress | null {
    if (!this.useNew() && this.addresses.addresses().length) {
      const a = this.addresses.addresses().find(x => x._id === this.selectedId());
      if (a) return { details: a.details, phone: a.phone, city: a.city };
    }
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set('Please complete the shipping address.'); return null; }
    return this.form.getRawValue();
  }

  private fail(e: unknown) { this.submitting.set(false); this.error.set(errorMessage(e)); }
}
