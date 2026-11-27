# FreshCart (Angular 22 + Tailwind CSS 4)

E-commerce storefront built from the "Freshcart – E-Commerce" Figma design. 17 pages, standalone components, signals, lazy-loaded routes, strict TypeScript.

## Run
```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build (needs internet once, to inline Google Fonts)
```

## Configure the API
Edit `src/environments/environment.ts` → `apiUrl`. All endpoints live in `src/app/core/config/api-endpoints.ts`;
the request/response shapes are typed in `src/app/core/models/`. The auth token is sent in a `token` header
(`src/app/core/interceptors/auth.interceptor.ts`) — change it there if your API uses `Authorization: Bearer`.

## Structure
```
src/app/
  core/       config, models, services (auth, cart, wishlist, catalog, orders, addresses), interceptor, guards
  shared/     layout (top bar, header, footer), ui (product card, pagination, toast...), pipes, validators
  features/   home · catalog (products, details, search, categories, brands) · auth (5 pages) · shop (cart, checkout, orders, wishlist) · account (settings, addresses)
```

## Placeholders to replace
- Phone `+20 100 000 0000`, email and "Cairo, Egypt" in `top-bar.ts` and `site-footer.ts`
- Promo banner copy on the home page (copied from the design)
