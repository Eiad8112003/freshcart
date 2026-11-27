import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../core/utils/errors';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { Spinner } from '../../shared/ui/spinner';

const FREE_SHIPPING_FROM = 500;

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, EgpPipe, PageHeader, EmptyState, Spinner],
  template: `
    <div class="container-page py-8">
      <app-page-header title="Shopping Cart" icon="fa-cart-shopping" [crumbs]="[{ label: 'Shopping Cart' }]"
        [subtitle]="cart.count() ? 'You have ' + cart.count() + (cart.count() === 1 ? ' item' : ' items') + ' in your cart' : ''" />

      @if (cart.loading() && !cart.lines().length) { <app-spinner /> }
      @else if (!cart.lines().length) {
        <app-empty-state icon="fa-cart-shopping" title="Your cart is empty" message="Looks like you haven’t added anything yet." actionLabel="Start shopping" />
      } @else {
        <div class="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <section aria-label="Cart items" class="space-y-4">
            @for (line of cart.lines(); track line.product._id) {
              <article class="card flex gap-4 p-4 sm:p-5">
                <a [routerLink]="['/products', line.product._id]" class="size-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:size-28">
                  <img [src]="line.product.imageCover" [alt]="line.product.title" class="size-full object-cover">
                </a>
                <div class="flex min-w-0 flex-1 flex-col gap-2">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <a [routerLink]="['/products', line.product._id]" class="line-clamp-2 font-semibold hover:text-primary-600">{{ line.product.title }}</a>
                      <span class="mt-1 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">{{ line.product.category.name }}</span>
                    </div>
                    <button class="btn-danger !p-2.5" (click)="remove(line.product._id)" [disabled]="busyId() === line.product._id" [attr.aria-label]="'Remove ' + line.product.title">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                  <p class="text-sm text-gray-600"><span class="font-semibold text-primary-600">{{ line.price | egp }}</span> per unit</p>
                  <div class="mt-auto flex items-end justify-between">
                    <div class="inline-flex items-center rounded-xl border border-gray-300" role="group" aria-label="Quantity">
                      <button class="size-10 hover:bg-gray-50 disabled:opacity-40" (click)="setCount(line.product._id, line.count - 1)" [disabled]="line.count <= 1 || busyId() === line.product._id" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
                      <span class="w-10 text-center font-semibold" aria-live="polite">{{ line.count }}</span>
                      <button class="size-10 hover:bg-gray-50 disabled:opacity-40" (click)="setCount(line.product._id, line.count + 1)" [disabled]="line.count >= line.product.quantity || busyId() === line.product._id" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <p class="text-right"><span class="block text-xs text-gray-600">Total</span><span class="text-lg font-bold">{{ line.price * line.count | egp }}</span></p>
                  </div>
                </div>
              </article>
            }
            <div class="flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
              <a routerLink="/products" class="font-semibold text-primary-600 hover:underline"><i class="fa-solid fa-arrow-left mr-1"></i>Continue Shopping</a>
              @if (!confirmClear()) {
                <button class="text-gray-600 hover:text-red-600" (click)="confirmClear.set(true)"><i class="fa-regular fa-trash-can mr-1.5"></i>Clear all items</button>
              } @else {
                <span class="flex items-center gap-3">Remove everything?
                  <button class="font-semibold text-red-600 hover:underline" (click)="clear()">Yes, clear</button>
                  <button class="font-semibold text-gray-700 hover:underline" (click)="confirmClear.set(false)">Cancel</button>
                </span>
              }
            </div>
          </section>

          <aside class="card overflow-hidden lg:sticky lg:top-24" aria-label="Order summary">
            <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
              <h2 class="flex items-center gap-2 text-lg font-bold"><i class="fa-solid fa-bag-shopping"></i>Order Summary</h2>
              <p class="text-sm text-white/90">{{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'items' }} in your cart</p>
            </div>
            <div class="space-y-4 p-6">
              <div class="rounded-xl bg-primary-50 p-4 text-sm">
                @if (qualifies()) {
                  <p class="font-semibold text-primary-700"><i class="fa-solid fa-truck mr-2"></i>Free Shipping! You qualify for free delivery</p>
                } @else {
                  <p class="font-semibold text-gray-700"><i class="fa-solid fa-truck mr-2 text-primary-600"></i>Add {{ remaining() | egp }} more for free shipping</p>
                }
              </div>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between"><dt class="text-gray-600">Subtotal</dt><dd class="font-medium">{{ cart.total() | egp }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-600">Shipping</dt><dd class="font-semibold" [class.text-primary-600]="qualifies()">{{ qualifies() ? 'FREE' : 'Calculated at checkout' }}</dd></div>
              </dl>
              <div class="flex items-baseline justify-between border-t border-dashed border-gray-300 pt-4">
                <span class="font-semibold">Total</span><span class="text-2xl font-bold">{{ cart.total() | egp }}</span>
              </div>
              <a routerLink="/checkout" class="btn-primary w-full !py-3.5"><i class="fa-solid fa-lock"></i>Secure Checkout</a>
              <p class="flex justify-center gap-4 text-xs text-gray-600"><span><i class="fa-solid fa-shield-halved mr-1 text-primary-600"></i>Secure Payment</span><span><i class="fa-solid fa-truck-fast mr-1 text-blue-500"></i>Fast Delivery</span></p>
            </div>
          </aside>
        </div>
      }
    </div>
  `,
})
export class CartPage {
  protected readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  protected readonly busyId = signal<string | null>(null);
  protected readonly confirmClear = signal(false);
  protected readonly qualifies = computed(() => this.cart.total() >= FREE_SHIPPING_FROM);
  protected readonly remaining = computed(() => Math.max(0, FREE_SHIPPING_FROM - this.cart.total()));

  protected setCount(id: string, count: number) {
    if (count < 1) return;
    this.busyId.set(id);
    this.cart.setCount(id, count).subscribe({
      next: () => this.busyId.set(null),
      error: e => { this.busyId.set(null); this.toast.error(errorMessage(e)); },
    });
  }
  protected remove(id: string) {
    this.busyId.set(id);
    this.cart.remove(id).subscribe({
      next: () => { this.busyId.set(null); this.toast.success('Item removed'); },
      error: e => { this.busyId.set(null); this.toast.error(errorMessage(e)); },
    });
  }
  protected clear() {
    this.cart.clear().subscribe({
      next: () => { this.confirmClear.set(false); this.toast.success('Cart cleared'); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
