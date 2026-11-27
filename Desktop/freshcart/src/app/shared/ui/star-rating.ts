import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <span class="inline-flex items-center gap-0.5 text-amber-400" [attr.aria-label]="'Rated ' + value() + ' out of 5'">
      @for (s of stars(); track $index) {
        <i class="fa-star text-xs" [class]="s === 'full' ? 'fa-solid' : s === 'half' ? 'fa-solid fa-star-half-stroke' : 'fa-regular'"></i>
      }
    </span>
  `,
})
export class StarRating {
  readonly value = input(0);
  protected readonly stars = computed(() => {
    const v = this.value();
    return Array.from({ length: 5 }, (_, i) => (v >= i + 1 ? 'full' : v >= i + 0.5 ? 'half' : 'empty'));
  });
}
