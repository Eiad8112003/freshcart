import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ItemResponse, ListResponse, Product } from '../../core/models/catalog.models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { errorMessage } from '../../core/utils/errors';
import { Loader } from '../../core/utils/loader';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { EmptyState } from '../../shared/ui/empty-state';
import { ProductCard } from '../../shared/ui/product-card';
import { Spinner } from '../../shared/ui/spinner';
import { StarRating } from '../../shared/ui/star-rating';

type Tab = 'details' | 'reviews' | 'shipping';

@Component({
  selector: 'app-product-details-page',
  imports: [RouterLink, EgpPipe, StarRating, Spinner, EmptyState, ProductCard],
  template: `
    <div class="container-page py-8">
      @if (state.loading()) { <app-spinner label="Loading product..." /> }
      @else if (state.error() || !product()) {
        <app-empty-state icon="fa-triangle-exclamation" title="Product not found" [message]="state.error() ?? 'This product may have been removed.'" actionLabel="Back to products" />
      } @else {
        @let p = product()!;
        <nav aria-label="Breadcrumb" class="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
          <a routerLink="/" class="hover:text-primary-600"><i class="fa-solid fa-house text-xs"></i> Home</a><span class="text-gray-400">/</span>
          <a [routerLink]="['/products']" [queryParams]="{ category: p.category._id }" class="hover:text-primary-600">{{ p.category.name }}</a><span class="text-gray-400">/</span>
          <span class="font-medium text-ink" aria-current="page">{{ p.title }}</span>
        </nav>

        <section class="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div class="card h-fit p-4">
            <div class="aspect-square overflow-hidden rounded-xl bg-gray-50">
              <img [src]="activeImage()" [alt]="p.title" class="size-full object-contain">
            </div>
            @if (images().length > 1) {
              <ul class="mt-3 flex gap-2 overflow-x-auto" aria-label="Product images">
                @for (img of images(); track img) {
                  <li>
                    <button class="block size-16 overflow-hidden rounded-lg border-2 bg-gray-50" [class]="img === activeImage() ? 'border-primary-600' : 'border-transparent'" (click)="activeImage.set(img)" [attr.aria-label]="'Show image'">
                      <img [src]="img" alt="" class="size-full object-cover">
                    </button>
                  </li>
                }
              </ul>
            }
          </div>

          <div class="card space-y-4 p-6">
            <div class="flex flex-wrap gap-2 text-xs font-semibold">
              <span class="rounded-full bg-primary-100 px-3 py-1 text-primary-700">{{ p.category.name }}</span>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{{ p.brand.name }}</span>
            </div>
            <h1 class="text-2xl font-bold sm:text-3xl">{{ p.title }}</h1>
            <div class="flex items-center gap-2 text-sm text-gray-600"><app-star-rating [value]="p.ratingsAverage" /> {{ p.ratingsAverage }} ({{ p.ratingsQuantity }} reviews)</div>
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-bold" [class.text-primary-600]="hasDiscount()">{{ unitPrice() | egp }}</span>
              @if (hasDiscount()) { <span class="text-lg text-gray-500 line-through">{{ p.price | egp }}</span> }
            </div>
            @if (p.quantity > 0) {
              <span class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"><i class="fa-solid fa-circle text-[8px]"></i>In Stock</span>
            } @else {
              <span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Out of Stock</span>
            }
            <p class="border-t border-gray-100 pt-4 text-gray-700">{{ p.description }}</p>

            <div>
              <p class="mb-2 text-sm font-semibold">Quantity</p>
              <div class="flex items-center gap-3">
                <div class="inline-flex items-center rounded-xl border border-gray-300">
                  <button class="size-11 hover:bg-gray-50 disabled:opacity-40" (click)="changeQty(-1)" [disabled]="qty() <= 1" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
                  <span class="w-12 text-center font-semibold" aria-live="polite">{{ qty() }}</span>
                  <button class="size-11 hover:bg-gray-50 disabled:opacity-40" (click)="changeQty(1)" [disabled]="qty() >= p.quantity" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
                </div>
                <span class="text-sm text-gray-600">{{ p.quantity }} available</span>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span class="text-gray-700">Total Price</span><span class="text-xl font-bold text-primary-600">{{ unitPrice() * qty() | egp }}</span>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <button class="btn-primary" (click)="addToCart(false)" [disabled]="busy() || p.quantity < 1"><i class="fa-solid fa-cart-shopping"></i>Add to Cart</button>
              <button class="btn-dark" (click)="addToCart(true)" [disabled]="busy() || p.quantity < 1"><i class="fa-solid fa-bolt"></i>Buy Now</button>
            </div>
            <button class="btn-outline w-full" (click)="toggleWishlist()" [attr.aria-pressed]="liked()">
              <i [class]="liked() ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>{{ liked() ? 'In your wishlist' : 'Add to Wishlist' }}
            </button>

            <ul class="grid gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
              <li class="flex items-center gap-2"><i class="fa-solid fa-truck text-primary-600"></i><span><b class="block">Free Delivery</b><span class="text-gray-600">Orders over 500 EGP</span></span></li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-rotate-left text-primary-600"></i><span><b class="block">14 Days Return</b><span class="text-gray-600">Money back</span></span></li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-shield-halved text-primary-600"></i><span><b class="block">Secure Payment</b><span class="text-gray-600">100% protected</span></span></li>
            </ul>
          </div>
        </section>

        <section class="card mt-10 overflow-hidden">
          <div class="flex border-b border-gray-100 text-sm font-semibold" role="tablist">
            @for (t of tabs; track t.id) {
              <button role="tab" class="px-5 py-4 transition" [attr.aria-selected]="tab() === t.id"
                [class]="tab() === t.id ? 'border-b-2 border-primary-600 bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-ink'" (click)="tab.set(t.id)">{{ t.label }}</button>
            }
          </div>
          <div class="p-6" role="tabpanel">
            @switch (tab()) {
              @case ('details') {
                <div class="grid gap-6 md:grid-cols-2">
                  <dl class="space-y-3 rounded-xl bg-gray-50 p-5 text-sm">
                    <h3 class="font-bold">Product Information</h3>
                    <div class="flex justify-between"><dt class="text-gray-600">Category</dt><dd class="font-medium">{{ p.category.name }}</dd></div>
                    @if (p.subcategory?.[0]) { <div class="flex justify-between"><dt class="text-gray-600">Subcategory</dt><dd class="font-medium">{{ p.subcategory[0].name }}</dd></div> }
                    <div class="flex justify-between"><dt class="text-gray-600">Brand</dt><dd class="font-medium">{{ p.brand.name }}</dd></div>
                    @if (p.sold != null) { <div class="flex justify-between"><dt class="text-gray-600">Items Sold</dt><dd class="font-medium">{{ p.sold }} sold</dd></div> }
                  </dl>
                  <div class="rounded-xl bg-gray-50 p-5 text-sm">
                    <h3 class="mb-3 font-bold">Key Features</h3>
                    <ul class="space-y-2">@for (f of features; track f) { <li><i class="fa-solid fa-check mr-2 text-primary-600"></i>{{ f }}</li> }</ul>
                  </div>
                </div>
              }
              @case ('reviews') { <p class="text-gray-600">Rated {{ p.ratingsAverage }} / 5 from {{ p.ratingsQuantity }} reviews. Detailed reviews aren’t available yet.</p> }
              @case ('shipping') { <p class="text-gray-600">Free shipping on orders over 500 EGP. Easy 14-day returns with a full money-back guarantee.</p> }
            }
          </div>
        </section>

        @if (relatedItems().length) {
          <section class="mt-12" aria-labelledby="rel">
            <h2 id="rel" class="mb-5 border-l-4 border-primary-600 pl-3 text-2xl font-bold">You May Also <span class="text-primary-600">Like</span></h2>
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              @for (r of relatedItems(); track r._id) { <app-product-card [product]="r" /> }
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class ProductDetailsPage {
  readonly id = input.required<string>();

  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly state = new Loader<ItemResponse<Product>>();
  protected readonly related = new Loader<ListResponse<Product>>();
  protected readonly product = computed(() => this.state.value()?.data ?? null);
  protected readonly relatedItems = computed(() => (this.related.value()?.data ?? []).filter(r => r._id !== this.product()?._id).slice(0, 4));
  protected readonly qty = signal(1);
  protected readonly busy = signal(false);
  protected readonly tab = signal<Tab>('details');
  protected readonly activeImage = signal('');
  protected readonly images = computed(() => {
    const p = this.product();
    return p ? [p.imageCover, ...(p.images ?? [])].filter((v, i, a) => !!v && a.indexOf(v) === i) : [];
  });
  protected readonly hasDiscount = computed(() => {
    const p = this.product();
    return !!p?.priceAfterDiscount && p.priceAfterDiscount < p.price;
  });
  protected readonly unitPrice = computed(() => {
    const p = this.product();
    return p ? (this.hasDiscount() ? p.priceAfterDiscount! : p.price) : 0;
  });
  protected readonly liked = computed(() => !!this.product() && this.wishlist.has(this.product()!._id));
  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Product Details' }, { id: 'reviews', label: 'Reviews' }, { id: 'shipping', label: 'Shipping & Returns' },
  ];
  protected readonly features = ['Premium Quality Product', '100% Authentic Guarantee', 'Fast & Secure Packaging', 'Quality Tested'];

  constructor() {
    effect(() => {
      this.state.run(this.catalog.product(this.id()));
      this.qty.set(1);
    });
    effect(() => {
      const p = this.product();
      if (!p) return;
      this.activeImage.set(p.imageCover);
      this.related.run(this.catalog.products({ category: p.category._id, limit: 5 }));
    });
  }

  protected changeQty(delta: number) {
    const max = this.product()?.quantity ?? 1;
    this.qty.update(q => Math.min(max, Math.max(1, q + delta)));
  }

  protected addToCart(buyNow: boolean) {
    const p = this.product();
    if (!p || !this.requireLogin()) return;
    this.busy.set(true);
    const existing = this.cart.lines().find(l => l.product._id === p._id)?.count ?? 0;
    const target = Math.min(p.quantity, existing + this.qty());
    this.cart.add(p._id).pipe(switchMap(r => (target > 1 ? this.cart.setCount(p._id, target) : [r]))).subscribe({
      next: () => {
        this.busy.set(false);
        if (buyNow) void this.router.navigate(['/checkout']); else this.toast.success('Added to cart');
      },
      error: e => { this.busy.set(false); this.toast.error(errorMessage(e)); },
    });
  }

  protected toggleWishlist() {
    const p = this.product();
    if (!p || !this.requireLogin()) return;
    const req = this.liked() ? this.wishlist.remove(p._id) : this.wishlist.add(p._id);
    req.subscribe({ next: () => this.toast.success(this.liked() ? 'Added to wishlist' : 'Removed from wishlist'), error: e => this.toast.error(errorMessage(e)) });
  }

  private requireLogin(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.toast.info('Please sign in first');
    void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }
}
