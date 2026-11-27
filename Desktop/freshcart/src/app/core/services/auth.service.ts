import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API } from '../config/api-endpoints';
import { AuthResponse, SignInPayload, SignUpPayload, User } from '../models/user.models';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'fc_token';
const USER_KEY = 'fc_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.storage.get(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token());
  /** Id decoded from the JWT payload; needed for the "my orders" endpoint. */
  readonly userId = computed(() => this.decodeId(this.token()));

  signUp(payload: SignUpPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API.signUp, payload).pipe(tap(r => this.startSession(r)));
  }

  signIn(payload: SignInPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API.signIn, payload).pipe(tap(r => this.startSession(r)));
  }

  forgotPassword(email: string) { return this.http.post<{ statusMsg: string; message: string }>(API.forgotPassword, { email }); }
  verifyResetCode(resetCode: string) { return this.http.post<{ status: string }>(API.verifyResetCode, { resetCode }); }
  resetPassword(email: string, newPassword: string) {
    return this.http.put<{ token: string }>(API.resetPassword, { email, newPassword });
  }

  updateProfile(data: Partial<Pick<User, 'name' | 'email' | 'phone'>>) {
    return this.http.put<{ message: string; user: User }>(API.updateMe, data).pipe(
      tap(r => this.setUser({ ...this.user(), ...r.user } as User)),
    );
  }

  changePassword(data: { currentPassword: string; password: string; rePassword: string }) {
    return this.http.put<{ message: string; token: string }>(API.changePassword, data).pipe(
      tap(r => { if (r.token) this.setToken(r.token); }),
    );
  }

  signOut(): void {
    this.token.set(null);
    this.user.set(null);
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
    void this.router.navigate(['/login']);
  }

  private startSession(res: AuthResponse) {
    this.setToken(res.token);
    this.setUser(res.user);
  }
  private setToken(token: string) { this.token.set(token); this.storage.set(TOKEN_KEY, token); }
  private setUser(user: User) { this.user.set(user); this.storage.set(USER_KEY, JSON.stringify(user)); }

  private readUser(): User | null {
    const raw = this.storage.get(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  }

  private decodeId(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return (JSON.parse(atob(payload)) as { id?: string }).id ?? null;
    } catch { return null; }
  }
}
