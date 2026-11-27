import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Loader } from '../../core/utils/loader';
import { ListResponse, Product } from '../../core/models/catalog.models';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { ProductCard } from '../../shared/ui/product-card';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-search-page',
  imports: [PageHeader, ProductCard, Pagination, Spinner, EmptyState],
  template: `
    <div class="container-page py-8">
      <app-page-header icon="fa-magnifying-glass" [title]="q() ? 'Results for “' + q() + '”' : 'Search products'"
        [subtitle]="summary()" [crumbs]="[{ label: 'Search' }]" />
      @if (!q()) {
        <app-empty-state icon="fa-magnifying-glass" title="What are you looking for?" message="Type a product, brand or category in the search bar above." actionLabel="Browse all products" />
      } @else if (list.loading()) { <app-spinner label="Searching..." /> }
      @else if (list.error()) { <p class="card p-6 text-sm text-red-600">{{ list.error() }}</p> }
      @else if (!list.value()?.data?.length) {
        <app-empty-state icon="fa-face-frown" title="No matches" [message]="'We couldn’t find anything for “' + q() + '”. Check the spelling or try a broader term.'" actionLabel="Browse all products" />
      } @else {
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          @for (p of list.value()?.data; track p._id) { <app-product-card [product]="p" /> }
        </div>
        <app-pagination [page]="list.value()?.metadata?.currentPage ?? 1" [pages]="list.value()?.metadata?.numberOfPages ?? 1" (pageChange)="goTo($event)" />
      }
    </div>
  `,
})
export class SearchPage {
  readonly q = input<string>();
  readonly page = input<string>();

  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  protected readonly list = new Loader<ListResponse<Product>>();
  protected readonly summary = computed(() => (this.q() && this.list.value() ? `${this.list.value()!.results} products on this page` : ''));

  constructor() {
    effect(() => {
      const keyword = this.q()?.trim();
      if (keyword) this.list.run(this.catalog.products({ keyword, page: Number(this.page()) || 1, limit: 15 }));
    });
  }
  protected goTo(page: number) { void this.router.navigate([], { queryParams: { page }, queryParamsHandling: 'merge' }); }
}
