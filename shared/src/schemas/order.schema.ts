import type { ShippingAddress } from "./address.schema.js";

export type PlaceOrderItem = { product_id: string; quantity: number };
export type OrderContact = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instagram?: string;
};
export type PlaceOrderRequest = {
  items: PlaceOrderItem[];
  address: ShippingAddress;
  contact: OrderContact;
};
