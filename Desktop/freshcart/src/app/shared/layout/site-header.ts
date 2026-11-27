import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/verify-code', '/reset-password'];

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div class="container-page flex h-16 items-center gap-4">
        <a routerLink="/" class="flex shrink-0 items-center gap-2 text-2xl font-bold" aria-label="FreshCart home">
          <i class="fa-solid fa-cart-shopping text-primary-600"></i><span>Fresh<span class="text-primary-600">Cart</span></span>
        </a>

        @if (!simple()) {
          <nav class="ml-4 hidden items-center gap-5 text-sm font-medium text-gray-700 xl:flex" aria-label="Main">
            @for (l of links; track l.path) {
              <a [routerLink]="l.path" routerLinkActive="text-primary-600" [routerLinkActiveOptions]="{ exact: l.path === '/' }" class="hover:text-primary-600">{{ l.label }}</a>
            }
          </nav>
          <form class="relative ml-auto hidden max-w-md flex-1 md:block" (submit)="search($event, q.value)">
            <input #q type="search" class="field !rounded-full !py-2.5 pr-12" placeholder="Search for products, brands and more..." aria-label="Search products">
            <button class="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-primary-600 text-white" aria-label="Search"><i class="fa-solid fa-magnifying-glass text-sm"></i></button>
          </form>
        } @else {
          <span class="ml-auto"></span>
        }

        <div class="flex items-center gap-1 sm:gap-2">
          @if (auth.isLoggedIn()) {
            <a routerLink="/wishlist" class="relative grid size-10 place-items-center rounded-full text-lg text-gray-700 hover:bg-gray-100" aria-label="Wishlist">
              <i class="fa-regular fa-heart"></i>
              @if (wishlist.count() > 0) { <span class="absolute -right-0.5 top-0 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{{ wishlist.count() }}</span> }
            </a>
            <a routerLink="/cart" class="relative grid size-10 place-items-center rounded-full text-lg text-gray-700 hover:bg-gray-100" aria-label="Cart">
              <i class="fa-solid fa-cart-shopping"></i>
              @if (cart.count() > 0) { <span class="absolute -right-0.5 top-0 grid min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white">{{ cart.count() }}</span> }
            </a>
            <a routerLink="/profile" class="grid size-10 place-items-center rounded-full text-lg text-gray-700 hover:bg-gray-100" aria-label="My account"><i class="fa-regular fa-circle-user"></i></a>
          } @else if (!simple()) {
            <a routerLink="/login" class="btn-primary !py-2.5"><i class="fa-regular fa-user"></i>Sign In</a>
          }
          @if (!simple()) {
            <button class="grid size-10 place-items-center rounded-full text-lg text-gray-700 hover:bg-gray-100 xl:hidden" (click)="menuOpen.set(!menuOpen())"
              [attr.aria-expanded]="menuOpen()" aria-label="Toggle menu"><i class="fa-solid" [class]="menuOpen() ? 'fa-xmark' : 'fa-bars'"></i></button>
          }
        </div>
      </div>

      @if (menuOpen() && !simple()) {
        <div class="border-t border-gray-100 bg-white px-4 py-4 xl:hidden">
          <form class="relative mb-3" (submit)="search($event, m.value)">
            <input #m type="search" class="field !rounded-full pr-12" placeholder="Search products..." aria-label="Search products">
            <button class="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-primary-600 text-white" aria-label="Search"><i class="fa-solid fa-magnifying-glass text-sm"></i></button>
          </form>
          <nav class="flex flex-col" aria-label="Mobile">
            @for (l of links; track l.path) {
              <a [routerLink]="l.path" (click)="menuOpen.set(false)" class="rounded-lg px-3 py-2.5 font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600">{{ l.label }}</a>
            }
            @if (auth.isLoggedIn()) {
              <button class="rounded-lg px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50" (click)="auth.signOut(); menuOpen.set(false)">Sign Out</button>
            } @else {
              <a routerLink="/signup" (click)="menuOpen.set(false)" class="rounded-lg px-3 py-2.5 font-medium text-gray-700 hover:bg-primary-50">Sign Up</a>
            }
          </nav>
        </div>
      }
    </header>
  `,
})
export class SiteHeader {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  protected readonly links = [
    { path: '/', label: 'Home' }, { path: '/products', label: 'Products' },
    { path: '/categories', label: 'Categories' }, { path: '/brands', label: 'Brands' },
    { path: '/orders', label: 'Orders' },
  ];

  private readonly url = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map(e => e.urlAfterRedirects)),
    { initialValue: this.router.url },
  );
  /** Auth pages get a minimal header: no search, no sign-in button, no duplicates. */
  protected readonly simple = computed(() => AUTH_ROUTES.some(r => this.url().startsWith(r)));

  protected search(ev: Event, term: string) {
    ev.preventDefault();
    this.menuOpen.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: term.trim() || null } });
  }
}
