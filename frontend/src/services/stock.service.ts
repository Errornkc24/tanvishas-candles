import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";

export const stockHistoryQuery = (productId?: string) =>
  queryOptions({
    queryKey: ["admin", "stock", productId],
    queryFn: async () => {
      let query = supabase
        .from("stock_adjustments")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(300);
      if (productId) query = query.eq("product_id", productId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

export function adjustStock(productId: string, change: number, reason: string, note?: string) {
  return supabase.rpc("admin_adjust_stock", {
    _product_id: productId,
    _change: change,
    _reason: reason,
    _note: note || undefined,
  });
}

export function setInitialStock(productId: string, quantity: number) {
  return supabase.rpc("admin_adjust_stock", {
    _product_id: productId,
    _change: quantity,
    _reason: "initial",
  });
}
