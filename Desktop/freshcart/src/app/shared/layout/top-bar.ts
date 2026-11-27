import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  template: `
    <div class="hidden border-b border-gray-100 bg-white text-xs text-gray-600 md:block">
      <div class="container-page flex h-10 items-center justify-between">
        <div class="flex items-center gap-5">
          <span><i class="fa-solid fa-truck mr-1.5 text-primary-600"></i>Free Shipping on Orders Over 500 EGP</span>
          <span><i class="fa-solid fa-gift mr-1.5 text-primary-600"></i>New Arrivals Daily</span>
        </div>
        <div class="flex items-center gap-5">
          <a href="tel:+201000000000" class="hover:text-primary-600"><i class="fa-solid fa-phone mr-1.5"></i>+20 100 000 0000</a>
          <a href="mailto:support@freshcart.com" class="hover:text-primary-600"><i class="fa-regular fa-envelope mr-1.5"></i>support&#64;freshcart.com</a>
          <span class="h-4 w-px bg-gray-200"></span>
          @if (auth.isLoggedIn()) {
            <span><i class="fa-regular fa-user mr-1.5"></i>{{ auth.user()?.name }}</span>
            <button class="hover:text-primary-600" (click)="auth.signOut()"><i class="fa-solid fa-arrow-right-from-bracket mr-1.5"></i>Sign Out</button>
          } @else {
            <a routerLink="/login" class="hover:text-primary-600"><i class="fa-regular fa-user mr-1.5"></i>Sign In</a>
            <a routerLink="/signup" class="hover:text-primary-600"><i class="fa-solid fa-user-plus mr-1.5"></i>Sign Up</a>
          }
        </div>
      </div>
    </div>
  `,
})
export class TopBar {
  protected readonly auth = inject(AuthService);
}
