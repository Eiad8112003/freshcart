import { DatePipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/shop.models';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Loader } from '../../core/utils/loader';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-orders-page',
  imports: [DatePipe, RouterLink, EgpPipe, PageHeader, EmptyState, Spinner],
  template: `
    <div class="container-page py-8">
      <app-page-header title="My Orders" icon="fa-box" subtitle="Track and review your purchases" [crumbs]="[{ label: 'Orders' }]" />
      @if (list.loading()) { <app-spinner label="Loading your orders..." /> }
      @else if (list.error()) { <p class="card p-6 text-sm text-red-600">{{ list.error() }}</p> }
      @else if (!list.value()?.length) {
        <app-empty-state icon="fa-box-open" title="No orders yet" message="When you place an order it will show up here." actionLabel="Start shopping" />
      } @else {
        <div class="space-y-5">
          @for (o of list.value(); track o._id) {
            <article class="card overflow-hidden">
              <header class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm">
                <div><p class="font-bold">Order #{{ o.id }}</p><p class="text-gray-600">{{ o.createdAt | date: 'mediumDate' }}</p></div>
                <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span class="rounded-full px-3 py-1" [class]="o.isPaid ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'">{{ o.isPaid ? 'Paid' : 'Payment pending' }}</span>
                  <span class="rounded-full px-3 py-1" [class]="o.isDelivered ? 'bg-primary-100 text-primary-700' : 'bg-blue-100 text-blue-700'">{{ o.isDelivered ? 'Delivered' : 'In progress' }}</span>
                  <span class="rounded-full bg-gray-200 px-3 py-1 text-gray-700">{{ o.paymentMethodType === 'cash' ? 'Cash on delivery' : 'Card' }}</span>
                </div>
              </header>
              <ul class="divide-y divide-gray-100">
                @for (i of o.cartItems; track i._id) {
                  <li class="flex items-center gap-4 px-5 py-3">
                    <img [src]="i.product.imageCover" [alt]="i.product.title" class="size-14 rounded-lg object-cover">
                    <a [routerLink]="['/products', i.product._id]" class="line-clamp-1 flex-1 font-medium hover:text-primary-600">{{ i.product.title }}</a>
                    <span class="text-sm text-gray-600">{{ i.count }} × {{ i.price | egp }}</span>
                  </li>
                }
              </ul>
              <footer class="flex items-center justify-between px-5 py-4"><span class="text-gray-600">Total</span><span class="text-xl font-bold text-primary-600">{{ o.totalOrderPrice | egp }}</span></footer>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersPage {
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  protected readonly list = new Loader<Order[]>();

  constructor() {
    effect(() => {
      const id = this.auth.userId();
      if (id) this.list.run(this.orders.userOrders(id));
    });
  }
}
