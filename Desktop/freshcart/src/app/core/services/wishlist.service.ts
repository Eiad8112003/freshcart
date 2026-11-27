import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API } from '../config/api-endpoints';
import { Product } from '../models/catalog.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly items = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly count = computed(() => this.items().length);
  private readonly ids = computed(() => new Set(this.items().map(p => p._id)));

  constructor() {
    effect(() => { if (this.auth.isLoggedIn()) this.load(); else this.items.set([]); });
  }

  has(productId: string): boolean { return this.ids().has(productId); }

  load(): void {
    this.loading.set(true);
    this.http.get<{ data: Product[] }>(API.wishlist).subscribe({
      next: r => { this.items.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  add(productId: string): Observable<unknown> {
    return this.http.post(API.wishlist, { productId }).pipe(tap(() => this.load()));
  }
  remove(productId: string): Observable<unknown> {
    return this.http.delete(API.wishlistItem(productId)).pipe(
      tap(() => this.items.update(list => list.filter(p => p._id !== productId))),
    );
  }
}
