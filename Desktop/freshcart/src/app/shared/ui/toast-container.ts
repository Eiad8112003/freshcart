import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg"
          [class]="t.type === 'success' ? 'bg-primary-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'" role="status">
          <i class="fa-solid" [class]="t.type === 'success' ? 'fa-circle-check' : t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'"></i>
          <span>{{ t.message }}</span>
          <button class="ml-2 opacity-80 hover:opacity-100" (click)="toasts.dismiss(t.id)" aria-label="Dismiss"><i class="fa-solid fa-xmark"></i></button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly toasts = inject(ToastService);
}
