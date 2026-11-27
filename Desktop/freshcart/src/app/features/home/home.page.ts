import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Loader } from '../../core/utils/loader';
import { ListResponse, Category, Product } from '../../core/models/catalog.models';
import { ProductCard } from '../../shared/ui/product-card';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ProductCard, Spinner],
  template: `
    <section class="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div class="container-page grid items-center gap-8 py-14 md:grid-cols-2 lg:py-20">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium"><i class="fa-solid fa-bolt"></i>Fresh deals every day</span>
          <h1 class="mt-5 text-4xl font-bold leading-tight sm:text-5xl">Everything you need,<br>delivered fresh.</h1>
          <p class="mt-4 max-w-lg text-lg text-white/90">Shop fashion, electronics, groceries and more from top brands, with free shipping on orders over 500 EGP.</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/products" class="btn bg-white text-primary-700 hover:bg-primary-50">Shop Now<i class="fa-solid fa-arrow-right"></i></a>
            <a routerLink="/categories" class="btn border border-white/60 text-white hover:bg-white/10">Browse Categories</a>
          </div>
        </div>
        <ul class="hidden grid-cols-2 gap-4 md:grid" aria-label="Highlights">
          @for (h of highlights; track h.title) {
            <li class="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <i [class]="'fa-solid text-2xl ' + h.icon"></i>
              <p class="mt-3 font-semibold">{{ h.title }}</p><p class="text-sm text-white/80">{{ h.text }}</p>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="container-page py-12" aria-labelledby="cat-title">
      <div class="mb-6 flex items-end justify-between">
        <h2 id="cat-title" class="border-l-4 border-primary-600 pl-3 text-2xl font-bold">Shop By <span class="text-primary-600">Category</span></h2>
        <a routerLink="/categories" class="text-sm font-semibold text-primary-600 hover:underline">View all <i class="fa-solid fa-arrow-right text-xs"></i></a>
      </div>
      @if (categories.loading()) { <app-spinner /> }
      @else if (categories.error()) { <p class="text-sm text-red-600">{{ categories.error() }}</p> }
      @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          @for (c of categories.value()?.data?.slice(0, 10); track c._id) {
            <a [routerLink]="['/products']" [queryParams]="{ category: c._id }" class="card group flex flex-col items-center gap-3 p-4 text-center transition hover:border-primary-600 hover:shadow-md">
              <img [src]="c.image" [alt]="c.name" loading="lazy" class="size-24 rounded-full object-cover transition group-hover:scale-105">
              <span class="text-sm font-semibold">{{ c.name }}</span>
            </a>
          }
        </div>
      }
    </section>

    <section class="container-page grid gap-6 pb-12 md:grid-cols-2" aria-label="Promotions">
      <div class="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-white">
        <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">🔥 Deal of the Day</span>
        <h3 class="mt-4 text-2xl font-bold">Fresh Organic Fruits</h3>
        <p class="mt-1 text-white/90">Get up to 40% off on selected items.</p>
        <p class="mt-4 text-sm">Use code: <code class="rounded bg-white/20 px-2 py-1 font-bold">ORGANIC40</code></p>
        <a routerLink="/products" class="btn mt-5 bg-white text-primary-700 hover:bg-primary-50">Shop Now</a>
      </div>
      <div class="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-8 text-white">
        <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">✨ New Arrivals</span>
        <h3 class="mt-4 text-2xl font-bold">Fresh Vegetables Collection</h3>
        <p class="mt-1 text-white/90">Get 25% off your first order.</p>
        <p class="mt-4 text-sm">Use code: <code class="rounded bg-white/20 px-2 py-1 font-bold">FRESH25</code></p>
        <a routerLink="/products" class="btn mt-5 bg-white text-rose-600 hover:bg-rose-50">Shop Now</a>
      </div>
    </section>

    <section class="container-page pb-14" aria-labelledby="feat-title">
      <div class="mb-6 flex items-end justify-between">
        <h2 id="feat-title" class="border-l-4 border-primary-600 pl-3 text-2xl font-bold">Featured <span class="text-primary-600">Products</span></h2>
        <a routerLink="/products" class="text-sm font-semibold text-primary-600 hover:underline">View all <i class="fa-solid fa-arrow-right text-xs"></i></a>
      </div>
      @if (products.loading()) { <app-spinner /> }
      @else if (products.error()) { <p class="text-sm text-red-600">{{ products.error() }}</p> }
      @else {
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          @for (p of products.value()?.data; track p._id) { <app-product-card [product]="p" /> }
        </div>
      }
    </section>
  `,
})
export class HomePage {
  private readonly catalog = inject(CatalogService);
  protected readonly categories = new Loader<ListResponse<Category>>();
  protected readonly products = new Loader<ListResponse<Product>>();
  protected readonly highlights = [
    { icon: 'fa-truck-fast', title: 'Fast delivery', text: 'Right to your door' },
    { icon: 'fa-shield-halved', title: 'Secure payment', text: '100% protected' },
    { icon: 'fa-rotate-left', title: 'Easy returns', text: '14-day policy' },
    { icon: 'fa-headset', title: '24/7 support', text: 'Always here to help' },
  ];

  constructor() {
    this.categories.run(this.catalog.categories$);
    this.products.run(this.catalog.products({ limit: 10 }));
  }
}
