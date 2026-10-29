import { queryOptions } from "@/hooks/use-query";
import { apiGet } from "@/services/api-client";
import type { SalesOrder } from "@/lib/sales-helpers";

export const adminSalesQuery = queryOptions({
  queryKey: ["admin", "sales"],
  queryFn: async (): Promise<SalesOrder[]> => {
    const orders: SalesOrder[] = [];
    // Page all history, rather than silently limiting reports to the latest 1,000 orders.
    for (let offset = 0; ; offset += 100) {
      const page = await apiGet<SalesOrder[]>(`/sales/orders?offset=${offset}&limit=100`);
      orders.push(...page);
      if (page.length < 100) break;
    }
    return orders;
  },
});
