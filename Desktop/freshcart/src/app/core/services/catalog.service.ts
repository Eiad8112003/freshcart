import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API } from '../config/api-endpoints';
import { Brand, Category, ItemResponse, ListResponse, Product, ProductQuery } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  /** Categories and brands rarely change: fetch once and share. */
  readonly categories$: Observable<ListResponse<Category>> = this.http
    .get<ListResponse<Category>>(API.categories).pipe(shareReplay(1));
  readonly brands$: Observable<ListResponse<Brand>> = this.http
    .get<ListResponse<Brand>>(API.brands, { params: { limit: 100 } }).pipe(shareReplay(1));

  products(query: ProductQuery = {}): Observable<ListResponse<Product>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.keyword) params = params.set('keyword', query.keyword);
    if (query.category) params = params.set('category[in]', query.category);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.minPrice != null) params = params.set('price[gte]', query.minPrice);
    if (query.maxPrice != null) params = params.set('price[lte]', query.maxPrice);
    return this.http.get<ListResponse<Product>>(API.products, { params });
  }

  product(id: string): Observable<ItemResponse<Product>> {
    return this.http.get<ItemResponse<Product>>(API.product(id));
  }
}
