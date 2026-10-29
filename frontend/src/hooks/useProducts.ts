import { useQuery } from "@/hooks/use-query";
import { categoriesQuery } from "@/services/categories.service";
import { productsQuery } from "@/services/products.service";

export function useProducts() {
  return useQuery(productsQuery);
}
export function useCategories() {
  return useQuery(categoriesQuery);
}
