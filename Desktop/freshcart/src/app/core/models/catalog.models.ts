export interface Category { _id: string; name: string; slug: string; image: string; }
export interface Brand { _id: string; name: string; slug: string; image: string; }
export interface Subcategory { _id: string; name: string; slug: string; category: string; }

export interface Product {
  _id: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  category: Category;
  subcategory: Subcategory[];
  brand: Brand;
  ratingsAverage: number;
  ratingsQuantity: number;
  sold?: number;
}

export interface Metadata { currentPage: number; numberOfPages: number; limit: number; nextPage?: number; prevPage?: number; }
export interface ListResponse<T> { results: number; metadata?: Metadata; data: T[]; }
export interface ItemResponse<T> { data: T; }

export interface ProductQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}
