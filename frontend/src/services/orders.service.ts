import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/shop-helpers";
import type { ShippingAddress } from "@shared/schemas/address.schema";
import type { OrderContact, PlaceOrderItem } from "@shared/schemas/order.schema";

export const customerOrdersQuery = (userId: string) =>
  queryOptions({
    queryKey: ["orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(name, image, quantity)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const customerOrderQuery = (orderId: string) =>
  queryOptions({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), order_status_history(status, created_at)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const adminOrderQuery = (orderId: string) =>
  queryOptions({
    queryKey: ["admin", "order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), order_status_history(*)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export function cancelCustomerOrder(orderId: string) {
  return supabase.rpc("cancel_order", { _order_id: orderId });
}

export function placeCustomerOrder(
  items: PlaceOrderItem[],
  address: ShippingAddress,
  contact: OrderContact,
) {
  return supabase.rpc("place_order", { _items: items, _address: address, _contact: contact });
}

export function updateOrder(
  orderId: string,
  status: OrderStatus,
  note?: string,
  courier?: string,
  tracking?: string,
) {
  return supabase.rpc("admin_update_order", {
    _order_id: orderId,
    _status: status,
    _note: note || undefined,
    _courier: courier || undefined,
    _tracking: tracking || undefined,
  });
}
