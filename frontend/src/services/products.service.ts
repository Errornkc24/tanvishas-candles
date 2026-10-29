import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/shop-helpers";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30_000,
});
