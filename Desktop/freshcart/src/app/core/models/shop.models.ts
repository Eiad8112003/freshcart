import { Product } from './catalog.models';
import { Address } from './user.models';

export interface CartLine { _id: string; count: number; price: number; product: Product; }
export interface CartData { _id: string; products: CartLine[]; totalCartPrice: number; }
export interface CartResponse { status: string; numOfCartItems: number; cartId: string; data: CartData; }

export type ShippingAddress = Pick<Address, 'details' | 'phone' | 'city'>;

export interface Order {
  _id: string;
  id: number;
  totalOrderPrice: number;
  shippingPrice: number;
  paymentMethodType: 'cash' | 'card';
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  cartItems: { _id: string; count: number; price: number; product: Product }[];
}
