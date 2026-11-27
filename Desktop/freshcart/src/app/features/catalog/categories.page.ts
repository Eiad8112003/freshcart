import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, ListResponse } from '../../core/models/catalog.models';
import { CatalogService } from '../../core/services/catalog.service';
import { Loader } from '../../core/utils/loader';
import { PageHeader } from '../../shared/ui/page-header';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-categories-page',
  imports: [RouterLink, PageHeader, Spinner],
  template: `
    <div class="container-page py-8">
      <app-page-header title="All Categories" icon="fa-layer-group" subtitle="Browse products by category" [crumbs]="[{ label: 'Categories' }]" />
      @if (list.loading()) { <app-spinner /> }
      @else if (list.error()) { <p class="card p-6 text-sm text-red-600">{{ list.error() }}</p> }
      @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (c of list.value()?.data; track c._id) {
            <a [routerLink]="['/products']" [queryParams]="{ category: c._id }" class="card group overflow-hidden transition hover:border-primary-600 hover:shadow-md">
              <img [src]="c.image" [alt]="c.name" loading="lazy" class="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105">
              <p class="p-4 text-center font-semibold group-hover:text-primary-600">{{ c.name }}</p>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class CategoriesPage {
  protected readonly list = new Loader<ListResponse<Category>>();
  constructor() { this.list.run(inject(CatalogService).categories$); }
}
