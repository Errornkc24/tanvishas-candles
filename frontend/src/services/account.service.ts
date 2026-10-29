import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type AddressInput = Omit<
  Database["public"]["Tables"]["addresses"]["Insert"],
  "id" | "created_at"
>;

export const profileQuery = (uid: string) =>
  queryOptions({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const addressesQuery = (uid: string) =>
  queryOptions({
    queryKey: ["addresses", uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", uid)
        .order("is_default", { ascending: false })
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

export async function updateProfile(
  uid: string,
  values: Database["public"]["Tables"]["profiles"]["Update"],
) {
  return supabase
    .from("profiles")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", uid);
}

export async function createAddress(values: AddressInput) {
  return supabase.from("addresses").insert(values).select().single();
}

export async function updateAddress(
  id: string,
  values: Database["public"]["Tables"]["addresses"]["Update"],
) {
  return supabase.from("addresses").update(values).eq("id", id);
}

export async function deleteAddress(id: string) {
  return supabase.from("addresses").delete().eq("id", id);
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const clear = await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);
  if (clear.error) return clear;
  return supabase.from("addresses").update({ is_default: true }).eq("id", addressId);
}
