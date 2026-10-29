import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shop-helpers";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("*").order("sort");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 60_000,
});

export function createCategory(name: string, slug: string, sort: number) {
  return supabase.from("categories").insert({ name: name.trim(), slug, sort });
}

export function renameCategory(id: string, name: string) {
  return supabase.from("categories").update({ name: name.trim() }).eq("id", id);
}

export function deleteCategory(id: string) {
  return supabase.from("categories").delete().eq("id", id);
}
