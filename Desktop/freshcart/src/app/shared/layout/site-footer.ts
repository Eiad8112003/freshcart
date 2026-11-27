import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300">
      <div class="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-6">
        <div class="lg:col-span-2">
          <a routerLink="/" class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xl font-bold text-ink">
            <i class="fa-solid fa-cart-shopping text-primary-600"></i><span>Fresh<span class="text-primary-600">Cart</span></span>
          </a>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-gray-300">FreshCart is your one-stop destination for quality products. From fashion to electronics, we bring you the best brands at competitive prices with a seamless shopping experience.</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li><i class="fa-solid fa-phone mr-2 text-primary-500"></i>+20 100 000 0000</li>
            <li><i class="fa-solid fa-envelope mr-2 text-primary-500"></i>support&#64;freshcart.com</li>
            <li><i class="fa-solid fa-location-dot mr-2 text-primary-500"></i>Cairo, Egypt</li>
          </ul>
          <div class="mt-5 flex gap-3">
            @for (s of socials; track s.icon) {
              <a href="#" class="grid size-10 place-items-center rounded-full bg-gray-800 hover:bg-primary-600" [attr.aria-label]="s.label"><i [class]="'fa-brands ' + s.icon"></i></a>
            }
          </div>
        </div>
        @for (col of columns; track col.title) {
          <nav [attr.aria-label]="col.title">
            <h3 class="mb-4 text-lg font-semibold text-white">{{ col.title }}</h3>
            <ul class="space-y-2.5 text-sm">
              @for (l of col.links; track l.label) { <li><a [routerLink]="l.path" class="hover:text-primary-500">{{ l.label }}</a></li> }
            </ul>
          </nav>
        }
      </div>
      <div class="border-t border-gray-800">
        <div class="container-page flex flex-col items-center justify-between gap-3 py-5 text-sm text-gray-400 sm:flex-row">
          <p>© {{ year }} FreshCart. All rights reserved.</p>
          <p class="flex items-center gap-4"><span><i class="fa-regular fa-credit-card mr-1.5"></i>Visa</span><span><i class="fa-regular fa-credit-card mr-1.5"></i>Mastercard</span><span><i class="fa-brands fa-paypal mr-1.5"></i>PayPal</span></p>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
  protected readonly socials = [
    { icon: 'fa-facebook-f', label: 'Facebook' }, { icon: 'fa-twitter', label: 'Twitter' },
    { icon: 'fa-instagram', label: 'Instagram' }, { icon: 'fa-youtube', label: 'YouTube' },
  ];
  protected readonly columns = [
    { title: 'Shop', links: [{ label: 'All Products', path: '/products' }, { label: 'Categories', path: '/categories' }, { label: 'Brands', path: '/brands' }] },
    { title: 'Account', links: [{ label: 'My Account', path: '/profile' }, { label: 'Order History', path: '/orders' }, { label: 'Wishlist', path: '/wishlist' }, { label: 'Shopping Cart', path: '/cart' }] },
    { title: 'Support', links: [{ label: 'Contact Us', path: '/' }, { label: 'Help Center', path: '/' }, { label: 'Shipping Info', path: '/' }, { label: 'Returns & Refunds', path: '/' }] },
    { title: 'Legal', links: [{ label: 'Privacy Policy', path: '/' }, { label: 'Terms of Service', path: '/' }, { label: 'Cookie Policy', path: '/' }] },
  ];
}
