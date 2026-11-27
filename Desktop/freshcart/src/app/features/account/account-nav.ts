import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-account-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="card p-2" aria-label="Account">
      @for (l of links; track l.path) {
        <a [routerLink]="l.path" routerLinkActive="bg-primary-50 text-primary-700" [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
          <i [class]="'fa-solid w-4 text-center ' + l.icon"></i>{{ l.label }}
        </a>
      }
    </nav>
  `,
})
export class AccountNav {
  protected readonly links = [
    { path: '/profile', label: 'Settings', icon: 'fa-gear' },
    { path: '/profile/addresses', label: 'Addresses', icon: 'fa-location-dot' },
    { path: '/orders', label: 'Orders', icon: 'fa-box' },
    { path: '/wishlist', label: 'Wishlist', icon: 'fa-heart' },
  ];
}
