import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand, ListResponse } from '../../core/models/catalog.models';
import { CatalogService } from '../../core/services/catalog.service';
import { Loader } from '../../core/utils/loader';
import { PageHeader } from '../../shared/ui/page-header';
import { Spinner } from '../../shared/ui/spinner';

@Component({
  selector: 'app-brands-page',
  imports: [RouterLink, PageHeader, Spinner],
  template: `
    <div class="container-page py-8">
      <app-page-header title="Top Brands" icon="fa-tags" subtitle="Shop from your favorite brands" [crumbs]="[{ label: 'Brands' }]" />
      @if (list.loading()) { <app-spinner /> }
      @else if (list.error()) { <p class="card p-6 text-sm text-red-600">{{ list.error() }}</p> }
      @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          @for (b of list.value()?.data; track b._id) {
            <a [routerLink]="['/products']" [queryParams]="{ brand: b._id }" class="card group flex flex-col items-center gap-3 p-5 transition hover:border-primary-600 hover:shadow-md">
              <img [src]="b.image" [alt]="b.name" loading="lazy" class="h-20 w-full object-contain transition group-hover:scale-105">
              <span class="text-sm font-semibold group-hover:text-primary-600">{{ b.name }}</span>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class BrandsPage {
  protected readonly list = new Loader<ListResponse<Brand>>();
  constructor() { this.list.run(inject(CatalogService).brands$); }
}
