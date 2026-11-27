import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../core/services/catalog.service';
import { Loader } from '../../core/utils/loader';
import { ListResponse, Product } from '../../core/models/catalog.models';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { ProductCard } from '../../shared/ui/product-card';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-products-page',
  imports: [PageHeader, ProductCard, Pagination, Spinner, EmptyState],
  template: `
    <div class="container-page py-8">
      <app-page-header title="All Products" icon="fa-box-open" [subtitle]="subtitle()" [crumbs]="[{ label: 'Products' }]" />

      <div class="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside class="card h-fit space-y-4 p-5" aria-label="Filters">
          <div>
            <label class="mb-1 block text-sm font-semibold" for="cat">Category</label>
            <select id="cat" class="field" [value]="category() ?? ''" (change)="setFilter('category', $any($event.target).value)">
              <option value="">All categories</option>
              @for (c of categories()?.data; track c._id) { <option [value]="c._id">{{ c.name }}</option> }
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold" for="brand">Brand</label>
            <select id="brand" class="field" [value]="brand() ?? ''" (change)="setFilter('brand', $any($event.target).value)">
              <option value="">All brands</option>
              @for (b of brands()?.data; track b._id) { <option [value]="b._id">{{ b.name }}</option> }
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold" for="sort">Sort by</label>
            <select id="sort" class="field" [value]="sort() ?? ''" (change)="setFilter('sort', $any($event.target).value)">
              <option value="">Featured</option>
              <option value="price">Price: low to high</option>
              <option value="-price">Price: high to low</option>
              <option value="-ratingsAverage">Top rated</option>
              <option value="-sold">Best selling</option>
            </select>
          </div>
          @if (hasFilters()) { <button class="btn-outline w-full" (click)="clear()"><i class="fa-solid fa-xmark"></i>Clear filters</button> }
        </aside>

        <section aria-live="polite">
          @if (list.loading()) { <app-spinner label="Loading products..." /> }
          @else if (list.error()) { <p class="card p-6 text-sm text-red-600">{{ list.error() }}</p> }
          @else if (!list.value()?.data?.length) {
            <app-empty-state icon="fa-magnifying-glass" title="No products found" message="Try changing or clearing your filters." />
          } @else {
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              @for (p of list.value()?.data; track p._id) { <app-product-card [product]="p" /> }
            </div>
            <app-pagination [page]="list.value()?.metadata?.currentPage ?? 1" [pages]="list.value()?.metadata?.numberOfPages ?? 1" (pageChange)="setFilter('page', '' + $event)" />
          }
        </section>
      </div>
    </div>
  `,
})
export class ProductsPage {
  // Bound from query params via withComponentInputBinding()
  readonly category = input<string>();
  readonly brand = input<string>();
  readonly sort = input<string>();
  readonly page = input<string>();

  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  protected readonly list = new Loader<ListResponse<Product>>();
  protected readonly categories = toSignal(this.catalog.categories$);
  protected readonly brands = toSignal(this.catalog.brands$);
  protected readonly hasFilters = computed(() => !!(this.category() || this.brand() || this.sort()));
  protected readonly subtitle = computed(() => {
    const n = this.list.value()?.metadata ? this.list.value()!.results : null;
    return n == null ? 'Browse our full catalog' : `Showing ${n} products on this page`;
  });

  constructor() {
    effect(() => {
      this.list.run(this.catalog.products({
        category: this.category(), brand: this.brand(), sort: this.sort(),
        page: Number(this.page()) || 1, limit: 12,
      }));
    });
  }

  protected setFilter(key: string, value: string) {
    void this.router.navigate([], {
      queryParams: { [key]: value || null, ...(key !== 'page' ? { page: null } : {}) },
      queryParamsHandling: 'merge',
    });
  }
  protected clear() {
    void this.router.navigate([], { queryParams: { category: null, brand: null, sort: null, page: null }, queryParamsHandling: 'merge' });
  }
}
