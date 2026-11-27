import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  template: `
    <div class="card mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
      <span class="grid size-16 place-items-center rounded-full bg-primary-100 text-2xl text-primary-600">
        <i [class]="'fa-solid ' + icon()"></i>
      </span>
      <h2 class="text-xl font-bold">{{ title() }}</h2>
      <p class="text-sm text-gray-600">{{ message() }}</p>
      @if (actionLabel()) {
        <a class="btn-primary mt-2" [routerLink]="actionLink()">{{ actionLabel() }}</a>
      }
    </div>
  `,
})
export class EmptyState {
  readonly icon = input('fa-box-open');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input('');
  readonly actionLink = input('/products');
}
