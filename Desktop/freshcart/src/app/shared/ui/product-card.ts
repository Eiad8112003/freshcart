import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../core/models/catalog.models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { errorMessage } from '../../core/utils/errors';
import { EgpPipe } from '../pipes/egp.pipe';
import { StarRating } from './star-rating';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, EgpPipe, StarRating],
  template: `
    @let p = product();
    <article class="card group relative flex h-full flex-col overflow-hidden transition hover:shadow-md">
      <div class="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button class="grid size-8 place-items-center rounded-full border border-gray-200 bg-white text-sm shadow-sm transition hover:text-red-500"
          [class]="liked() ? 'text-red-500' : 'text-gray-600'" (click)="toggleWishlist()"
          [attr.aria-pressed]="liked()" [attr.aria-label]="liked() ? 'Remove from wishlist' : 'Add to wishlist'">
          <i [class]="liked() ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
        </button>
        <a class="grid size-8 place-items-center rounded-full border border-gray-200 bg-white text-sm text-gray-600 shadow-sm hover:text-primary-600"
          [routerLink]="['/products', p._id]" aria-label="View product"><i class="fa-regular fa-eye"></i></a>
      </div>
      <a [routerLink]="['/products', p._id]" class="block aspect-square overflow-hidden bg-gray-50">
        <img [src]="p.imageCover" [alt]="p.title" loading="lazy" class="size-full object-cover transition duration-300 group-hover:scale-105">
      </a>
      <div class="flex flex-1 flex-col gap-1.5 p-4">
        <span class="text-xs font-medium text-gray-500">{{ p.category.name }}</span>
        <a [routerLink]="['/products', p._id]" class="line-clamp-1 font-semibold hover:text-primary-600">{{ p.title }}</a>
        <div class="flex items-center gap-1.5 text-xs text-gray-600">
          <app-star-rating [value]="p.ratingsAverage" /> <span>{{ p.ratingsAverage }} ({{ p.ratingsQuantity }})</span>
        </div>
        <div class="mt-auto flex items-end justify-between pt-3">
          <div class="flex flex-col leading-tight">
            @if (hasDiscount()) {
              <span class="text-xs text-gray-500 line-through">{{ p.price | egp }}</span>
              <span class="text-lg font-bold text-primary-600">{{ p.priceAfterDiscount | egp }}</span>
            } @else {
              <span class="text-lg font-bold">{{ p.price | egp }}</span>
            }
          </div>
          <button class="grid size-10 place-items-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-60"
            (click)="addToCart()" [disabled]="adding()" aria-label="Add to cart">
            <i class="fa-solid" [class]="adding() ? 'fa-circle-notch fa-spin' : 'fa-plus'"></i>
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly adding = signal(false);
  protected readonly liked = computed(() => this.wishlist.has(this.product()._id));
  protected readonly hasDiscount = computed(() => {
    const p = this.product();
    return !!p.priceAfterDiscount && p.priceAfterDiscount < p.price;
  });

  protected addToCart() {
    if (!this.requireLogin()) return;
    this.adding.set(true);
    this.cart.add(this.product()._id).subscribe({
      next: () => { this.toast.success('Added to cart'); this.adding.set(false); },
      error: e => { this.toast.error(errorMessage(e)); this.adding.set(false); },
    });
  }

  protected toggleWishlist() {
    if (!this.requireLogin()) return;
    const id = this.product()._id;
    const req = this.liked() ? this.wishlist.remove(id) : this.wishlist.add(id);
    req.subscribe({
      next: () => this.toast.success(this.liked() ? 'Added to wishlist' : 'Removed from wishlist'),
      error: e => this.toast.error(errorMessage(e)),
    });
  }

  private requireLogin(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.toast.info('Please sign in first');
    void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }
}
