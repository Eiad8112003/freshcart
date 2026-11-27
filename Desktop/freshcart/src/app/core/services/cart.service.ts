import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API } from '../config/api-endpoints';
import { CartData, CartResponse } from '../models/shop.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly cart = signal<CartData | null>(null);
  readonly cartId = signal<string | null>(null);
  readonly count = signal(0);
  readonly loading = signal(false);
  readonly lines = computed(() => this.cart()?.products ?? []);
  readonly total = computed(() => this.cart()?.totalCartPrice ?? 0);

  constructor() {
    // Load on login, clear on logout.
    effect(() => {
      if (this.auth.isLoggedIn()) this.load(); else this.reset();
    });
  }

  load(): void {
    this.loading.set(true);
    this.http.get<CartResponse>(API.cart).subscribe({
      next: r => { this.apply(r); this.loading.set(false); },
      error: () => { this.reset(); this.loading.set(false); },
    });
  }

  add(productId: string): Observable<CartResponse> {
    return this.http.post<CartResponse>(API.cart, { productId }).pipe(tap(r => this.apply(r)));
  }
  setCount(productId: string, count: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(API.cartItem(productId), { count }).pipe(tap(r => this.apply(r)));
  }
  remove(productId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(API.cartItem(productId)).pipe(tap(r => this.apply(r)));
  }
  clear(): Observable<unknown> {
    return this.http.delete(API.cart).pipe(tap(() => this.reset()));
  }

  /** Called after a successful cash order: the server empties the cart. */
  reset(): void { this.cart.set(null); this.cartId.set(null); this.count.set(0); }

  private apply(r: CartResponse): void {
    this.cart.set(r.data);
    this.cartId.set(r.cartId ?? r.data?._id ?? null);
    this.count.set(r.numOfCartItems ?? r.data?.products?.length ?? 0);
  }
}
