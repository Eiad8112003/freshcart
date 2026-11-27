import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', title: 'FreshCart – Your One-Stop Shop', loadComponent: () => import('./features/home/home.page').then(m => m.HomePage) },
  { path: 'products', title: 'Products – FreshCart', loadComponent: () => import('./features/catalog/products.page').then(m => m.ProductsPage) },
  { path: 'products/:id', title: 'Product – FreshCart', loadComponent: () => import('./features/catalog/product-details.page').then(m => m.ProductDetailsPage) },
  { path: 'search', title: 'Search – FreshCart', loadComponent: () => import('./features/catalog/search.page').then(m => m.SearchPage) },
  { path: 'categories', title: 'Categories – FreshCart', loadComponent: () => import('./features/catalog/categories.page').then(m => m.CategoriesPage) },
  { path: 'brands', title: 'Brands – FreshCart', loadComponent: () => import('./features/catalog/brands.page').then(m => m.BrandsPage) },

  { path: 'login', title: 'Sign In – FreshCart', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage) },
  { path: 'signup', title: 'Create Account – FreshCart', canActivate: [guestGuard], loadComponent: () => import('./features/auth/signup.page').then(m => m.SignupPage) },
  { path: 'forgot-password', title: 'Forgot Password – FreshCart', canActivate: [guestGuard], loadComponent: () => import('./features/auth/forgot-password.page').then(m => m.ForgotPasswordPage) },
  { path: 'verify-code', title: 'Verify Code – FreshCart', canActivate: [guestGuard], loadComponent: () => import('./features/auth/verify-code.page').then(m => m.VerifyCodePage) },
  { path: 'reset-password', title: 'Reset Password – FreshCart', canActivate: [guestGuard], loadComponent: () => import('./features/auth/reset-password.page').then(m => m.ResetPasswordPage) },

  { path: 'cart', title: 'Shopping Cart – FreshCart', canActivate: [authGuard], loadComponent: () => import('./features/shop/cart.page').then(m => m.CartPage) },
  { path: 'checkout', title: 'Checkout – FreshCart', canActivate: [authGuard], loadComponent: () => import('./features/shop/checkout.page').then(m => m.CheckoutPage) },
  { path: 'orders', title: 'My Orders – FreshCart', canActivate: [authGuard], loadComponent: () => import('./features/shop/orders.page').then(m => m.OrdersPage) },
  { path: 'wishlist', title: 'My Wishlist – FreshCart', canActivate: [authGuard], loadComponent: () => import('./features/shop/wishlist.page').then(m => m.WishlistPage) },

  { path: 'profile', title: 'Account Settings – FreshCart', canActivate: [authGuard], loadComponent: () => import('./features/account/profile-settings.page').then(m => m.ProfileSettingsPage) },
  { path: 'profile/addresses', title: 'My Addresses – FreshCart', canActivate: [authGuard], loadComponent: () => import('./features/account/addresses.page').then(m => m.AddressesPage) },

  { path: '**', redirectTo: '' },
];
