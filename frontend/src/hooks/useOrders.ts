import { useQuery } from "@/hooks/use-query";
import {
  adminOrderQuery,
  customerOrderQuery,
  customerOrdersQuery,
} from "@/services/orders.service";

export function useCustomerOrders(userId: string) {
  return useQuery(customerOrdersQuery(userId));
}
export function useCustomerOrder(orderId: string) {
  return useQuery(customerOrderQuery(orderId));
}
export function useAdminOrder(orderId: string) {
  return useQuery(adminOrderQuery(orderId));
}
