import { HttpErrorResponse } from '@angular/common/http';

/** Extracts a friendly message from an API error. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string; errors?: { msg?: string } } | null;
    return body?.message ?? body?.errors?.msg ?? (err.status === 0 ? 'Network error. Check your connection.' : fallback);
  }
  return fallback;
}
