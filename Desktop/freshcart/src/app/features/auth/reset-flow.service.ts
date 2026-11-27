import { Injectable, signal } from '@angular/core';

/** Holds the email + verification state across the 3-step password reset. In-memory only. */
@Injectable({ providedIn: 'root' })
export class ResetFlowService {
  readonly email = signal<string | null>(null);
  readonly verified = signal(false);

  start(email: string) { this.email.set(email); this.verified.set(false); }
  markVerified() { this.verified.set(true); }
  clear() { this.email.set(null); this.verified.set(false); }
}
