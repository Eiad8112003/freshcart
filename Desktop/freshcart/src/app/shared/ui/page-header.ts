import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb { label: string; link?: string; }

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  template: `
    <header class="mb-6">
      <nav aria-label="Breadcrumb" class="mb-3 text-sm text-gray-600">
        <ol class="flex flex-wrap items-center gap-1.5">
          <li><a routerLink="/" class="hover:text-primary-600">Home</a></li>
          @for (c of crumbs(); track c.label) {
            <li aria-hidden="true" class="text-gray-400">/</li>
            <li>
              @if (c.link) { <a [routerLink]="c.link" class="hover:text-primary-600">{{ c.label }}</a> }
              @else { <span class="font-medium text-ink" aria-current="page">{{ c.label }}</span> }
            </li>
          }
        </ol>
      </nav>
      <div class="flex items-center gap-4">
        <span class="grid size-12 place-items-center rounded-xl bg-primary-600 text-xl text-white"><i [class]="'fa-solid ' + icon()"></i></span>
        <div>
          <h1 class="text-2xl font-bold sm:text-3xl">{{ title() }}</h1>
          @if (subtitle()) { <p class="text-sm text-gray-600">{{ subtitle() }}</p> }
        </div>
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input('fa-bag-shopping');
  readonly crumbs = input<Crumb[]>([]);
}
