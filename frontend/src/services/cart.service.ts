import { supabase } from "@/lib/supabase";

export async function getSavedCart(userId: string) {
  return supabase.from("cart_items").select("product_id, quantity").eq("user_id", userId);
}

export async function saveCartItems(
  userId: string,
  items: { productId: string; quantity: number }[],
) {
  if (!items.length) return { data: null, error: null };
  return supabase.from("cart_items").upsert(
    items.map(({ productId, quantity }) => ({
      user_id: userId,
      product_id: productId,
      quantity,
    })),
  );
}

export async function saveCartItem(userId: string, productId: string, quantity: number) {
  return supabase.from("cart_items").upsert({
    user_id: userId,
    product_id: productId,
    quantity,
  });
}

export async function removeCartItem(userId: string, productId: string) {
  return supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId);
}
