import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API } from '../config/api-endpoints';
import { Address, AddressPayload } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  readonly addresses = signal<Address[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.http.get<{ data: Address[] }>(API.addresses).subscribe({
      next: r => { this.addresses.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  add(payload: AddressPayload) {
    return this.http.post<{ data: Address[] }>(API.addresses, payload).pipe(tap(r => this.addresses.set(r.data)));
  }
  remove(id: string) {
    return this.http.delete<{ data: Address[] }>(API.address(id)).pipe(tap(r => this.addresses.set(r.data)));
  }
}
