import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { errorMessage } from '../../core/utils/errors';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-wishlist-page',
  imports: [RouterLink, EgpPipe, PageHeader, EmptyState, Spinner],
  template: `
    <div class="container-page py-8">
      <app-page-header title="My Wishlist" icon="fa-heart" [subtitle]="wishlist.count() + (wishlist.count() === 1 ? ' item saved' : ' items saved')" [crumbs]="[{ label: 'Wishlist' }]" />
      @if (wishlist.loading() && !wishlist.items().length) { <app-spinner /> }
      @else if (!wishlist.items().length) {
        <app-empty-state icon="fa-heart" title="Your wishlist is empty" message="Tap the heart on any product to save it for later." actionLabel="Discover products" />
      } @else {
        <ul class="space-y-3">
          @for (p of wishlist.items(); track p._id) {
            <li class="card flex items-center gap-4 p-4">
              <a [routerLink]="['/products', p._id]" class="size-20 shrink-0 overflow-hidden rounded-xl bg-gray-50"><img [src]="p.imageCover" [alt]="p.title" class="size-full object-cover"></a>
              <div class="min-w-0 flex-1">
                <a [routerLink]="['/products', p._id]" class="line-clamp-1 font-semibold hover:text-primary-600">{{ p.title }}</a>
                <p class="text-xs text-gray-600">{{ p.category.name }}</p>
                <p class="mt-1 font-bold text-primary-600">{{ (p.priceAfterDiscount ?? p.price) | egp }}</p>
              </div>
              <button class="btn-primary !px-4 !py-2.5" (click)="addToCart(p._id)" [disabled]="busyId() === p._id"><i class="fa-solid fa-cart-plus"></i><span class="hidden sm:inline">Add to cart</span></button>
              <button class="btn-danger !p-2.5" (click)="remove(p._id)" [attr.aria-label]="'Remove ' + p.title"><i class="fa-regular fa-trash-can"></i></button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  protected readonly busyId = signal<string | null>(null);

  protected addToCart(id: string) {
    this.busyId.set(id);
    this.cart.add(id).subscribe({
      next: () => { this.busyId.set(null); this.toast.success('Added to cart'); },
      error: e => { this.busyId.set(null); this.toast.error(errorMessage(e)); },
    });
  }
  protected remove(id: string) {
    this.wishlist.remove(id).subscribe({ next: () => this.toast.success('Removed from wishlist'), error: e => this.toast.error(errorMessage(e)) });
  }
}
