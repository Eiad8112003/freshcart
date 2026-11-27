import { Component } from '@angular/core';

@Component({
  selector: 'app-features-strip',
  template: `
    <section class="border-t border-primary-100 bg-primary-50" aria-label="Store benefits">
      <div class="container-page grid grid-cols-2 gap-6 py-6 lg:grid-cols-4">
        @for (f of features; track f.title) {
          <div class="flex items-center gap-3">
            <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-600"><i [class]="'fa-solid ' + f.icon"></i></span>
            <div class="leading-tight"><p class="text-sm font-semibold">{{ f.title }}</p><p class="text-xs text-gray-600">{{ f.text }}</p></div>
          </div>
        }
      </div>
    </section>
  `,
})
export class FeaturesStrip {
  protected readonly features = [
    { icon: 'fa-truck', title: 'Free Shipping', text: 'On orders over 500 EGP' },
    { icon: 'fa-rotate-left', title: 'Easy Returns', text: '14-day return policy' },
    { icon: 'fa-shield-halved', title: 'Secure Payment', text: '100% secure checkout' },
    { icon: 'fa-headset', title: '24/7 Support', text: 'Contact us anytime' },
  ];
}
