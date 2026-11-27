import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

/** Single place for every REST endpoint. Adjust here if your API differs. */
export const API = {
  products: `${base}/products`,
  product: (id: string) => `${base}/products/${id}`,
  categories: `${base}/categories`,
  brands: `${base}/brands`,
  signUp: `${base}/auth/signup`,
  signIn: `${base}/auth/signin`,
  forgotPassword: `${base}/auth/forgotPasswords`,
  verifyResetCode: `${base}/auth/verifyResetCode`,
  resetPassword: `${base}/auth/resetPassword`,
  cart: `${base}/cart`,
  cartItem: (productId: string) => `${base}/cart/${productId}`,
  wishlist: `${base}/wishlist`,
  wishlistItem: (productId: string) => `${base}/wishlist/${productId}`,
  cashOrder: (cartId: string) => `${base}/orders/${cartId}`,
  cardOrder: (cartId: string) => `${base}/orders/checkout-session/${cartId}`,
  userOrders: (userId: string) => `${base}/orders/user/${userId}`,
  addresses: `${base}/addresses`,
  address: (id: string) => `${base}/addresses/${id}`,
  updateMe: `${base}/users/updateMe/`,
  changePassword: `${base}/users/changeMyPassword`,
} as const;
