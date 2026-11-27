export interface User { name: string; email: string; role?: string; phone?: string; }
export interface AuthResponse { message: string; user: User; token: string; }
export interface SignUpPayload { name: string; email: string; phone: string; password: string; rePassword: string; }
export interface SignInPayload { email: string; password: string; }
export interface Address { _id: string; name: string; details: string; phone: string; city: string; }
export type AddressPayload = Omit<Address, '_id'>;
