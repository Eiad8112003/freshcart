import { Observable, Subscription } from 'rxjs';
import { signal } from '@angular/core';
import { errorMessage } from './errors';

/** Tiny signal-based request holder. A new run() cancels the previous one. */
export class Loader<T> {
  readonly value = signal<T | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private sub?: Subscription;

  run(source: Observable<T>): void {
    this.sub?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    this.sub = source.subscribe({
      next: v => { this.value.set(v); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
