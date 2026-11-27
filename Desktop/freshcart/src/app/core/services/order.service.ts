import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../config/api-endpoints';
import { Order, ShippingAddress } from '../models/shop.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  placeCashOrder(cartId: string, shippingAddress: ShippingAddress) {
    return this.http.post(API.cashOrder(cartId), { shippingAddress });
  }

  /** Returns a Stripe session; redirect the browser to `session.url`. */
  createCardSession(cartId: string, shippingAddress: ShippingAddress) {
    const params = new HttpParams().set('url', window.location.origin);
    return this.http.post<{ session: { url: string } }>(API.cardOrder(cartId), { shippingAddress }, { params });
  }

  userOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(API.userOrders(userId));
  }
}
