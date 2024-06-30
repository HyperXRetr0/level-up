import { CartItem, Order, Product, ShippingInfo, User } from "./types";

export type MessageResponse = {
  success: boolean;
  message: string;
};

export type UserResponse = {
  success: boolean;
  user: User;
};

export type AllProductResonse = {
  success: boolean;
  products: Product[];
};

export type CategoryResponse = {
  success: boolean;
  categories: string[];
};

export type SearchProductResponse = {
  success: boolean;
  products: Product[];
  totalPage: number;
};

export type SearchProductRequest = {
  search: string;
  price: number;
  page: number;
  category: string;
  sort: string;
};

export type NewProductRequest = {
  id: string;
  formData: FormData;
};

export type NewOrderRequest = {
  orderItems: CartItem[];
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  shippingInfo: ShippingInfo;
  user: string;
};

export type AllOrdersResponse = {
  success: boolean;
  orders: Order[];
};

export type OrderDetailResponse = {
  success: boolean;
  orders: Order;
};

export type UpdateOrderRequest = {
  userId: string;
  orderId: string;
};
