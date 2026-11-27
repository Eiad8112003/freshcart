import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500" role="status">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-600"></i>
      <span class="text-sm">{{ label() }}</span>
    </div>
  `,
})
export class Spinner {
  readonly label = input('Loading...');
}
