import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type AdminRole = Database["public"]["Enums"]["app_role"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type DashboardSummary = {
  orders_today: number;
  sales_today: number;
  sales_this_month: number;
  to_pack_count: number;
  recent_orders: Pick<Order, "id" | "order_number" | "created_at" | "status" | "total" | "contact">[];
  low_stock: Pick<
    Database["public"]["Tables"]["products"]["Row"],
    "id" | "name" | "stock" | "low_stock_threshold"
  >[];
};

export const adminDashboardQuery = queryOptions({
  queryKey: ["admin", "dashboard"],
  queryFn: async (): Promise<DashboardSummary> => {
    const { data, error } = await supabase.rpc("admin_dashboard_summary");
    if (error) throw error;
    return data as unknown as DashboardSummary;
  },
});

export const rolesQuery = (userId: string) =>
  queryOptions({
    queryKey: ["roles", userId],
    queryFn: async (): Promise<AdminRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((role) => role.role);
    },
  });

export const isAdminRole = (roles?: AdminRole[]) =>
  !!roles?.some((r) => r === "owner" || r === "staff");

/** A product is low when its stock is at or below its own alert level (but still counts out-of-stock). */
export function isLowStock(p: { stock: number; low_stock_threshold: number; archived?: boolean }) {
  return !p.archived && p.stock <= p.low_stock_threshold;
}

export const adminProductsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const adminOrdersQuery = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data ?? [];
  },
});

export const storeHasOwnerQuery = queryOptions({
  queryKey: ["store_has_owner"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("store_has_owner");
    if (error) throw error;
    return data ?? true;
  },
});

export function claimStoreOwnership() {
  return supabase.rpc("claim_owner");
}

export function updateProduct(
  productId: string,
  values: Database["public"]["Tables"]["products"]["Update"],
) {
  return supabase.from("products").update(values).eq("id", productId);
}

export function createProduct(values: Database["public"]["Tables"]["products"]["Insert"]) {
  return supabase.from("products").insert(values).select("id").single();
}

export function contactOf(o: Pick<Order, "contact">) {
  return (o.contact ?? {}) as Record<string, string>;
}
export function addressOf(o: Order) {
  return (o.shipping_address ?? {}) as Record<string, string>;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
