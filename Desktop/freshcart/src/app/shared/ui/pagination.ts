import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (pages() > 1) {
      <nav class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
        <button class="btn-outline !px-3 !py-2" [disabled]="page() <= 1" (click)="go(page() - 1)" aria-label="Previous page">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        @for (p of numbers(); track p) {
          <button class="size-10 rounded-xl text-sm font-semibold transition"
            [class]="p === page() ? 'bg-primary-600 text-white' : 'border border-gray-300 bg-white hover:border-primary-600'"
            [attr.aria-current]="p === page() ? 'page' : null" (click)="go(p)">{{ p }}</button>
        }
        <button class="btn-outline !px-3 !py-2" [disabled]="page() >= pages()" (click)="go(page() + 1)" aria-label="Next page">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input(1);
  readonly pages = input(1);
  readonly pageChange = output<number>();
  protected readonly numbers = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));
  protected go(p: number) { if (p >= 1 && p <= this.pages()) this.pageChange.emit(p); }
}
