import { Component, input } from '@angular/core';

/** Shared layout for auth pages: optional marketing column + form card. */
@Component({
  selector: 'app-auth-shell',
  template: `
    <div class="container-page py-10 lg:py-16">
      <div class="mx-auto grid items-center gap-10" [class]="hero() ? 'max-w-6xl lg:grid-cols-2' : 'max-w-xl'">
        @if (hero()) {
          <div class="hidden text-center lg:block">
            <div class="mx-auto grid aspect-[4/3] max-w-md place-items-center rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-sm">
              <i class="fa-solid fa-basket-shopping text-9xl"></i>
            </div>
            <h2 class="mt-8 text-3xl font-bold">FreshCart – Your One-Stop Shop for Fresh Products</h2>
            <p class="mt-3 text-lg text-gray-600">Join thousands of happy customers who trust FreshCart for their daily needs.</p>
            <ul class="mt-6 flex justify-center gap-6 text-sm font-medium text-gray-700">
              <li><i class="fa-solid fa-truck mr-1.5 text-primary-600"></i>Free Delivery</li>
              <li><i class="fa-solid fa-shield-halved mr-1.5 text-primary-600"></i>Secure Payment</li>
              <li><i class="fa-solid fa-clock mr-1.5 text-primary-600"></i>24/7 Support</li>
            </ul>
          </div>
        }
        <div class="card p-6 sm:p-10">
          <p class="text-center text-2xl font-bold">Fresh<span class="text-primary-600">Cart</span></p>
          <h1 class="mt-3 text-center text-2xl font-bold">{{ heading() }}</h1>
          <p class="mb-6 mt-1 text-center text-gray-600">{{ subheading() }}</p>
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class AuthShell {
  readonly heading = input.required<string>();
  readonly subheading = input('');
  readonly hero = input(true);
}
