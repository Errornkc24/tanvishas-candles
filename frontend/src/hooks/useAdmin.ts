import { useQuery } from "@/hooks/use-query";
import { useAuth } from "@/context/AuthContext";
import { adminOrdersQuery, adminProductsQuery, rolesQuery } from "@/services/admin.service";

export function useRoles() {
  const { user } = useAuth();
  return useQuery({ ...rolesQuery(user?.id ?? ""), enabled: !!user });
}

export function useAdminProducts() {
  return useQuery(adminProductsQuery);
}
export function useAdminOrders() {
  return useQuery(adminOrdersQuery);
}
