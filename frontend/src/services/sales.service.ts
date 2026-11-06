import { queryOptions } from "@/hooks/use-query";
import { supabase } from "@/lib/supabase";
import type { Granularity, SalesReport } from "@/lib/sales-helpers";

export const adminSalesReportQuery = (
  from: string,
  to: string,
  group: Granularity,
  enabled = true,
) => queryOptions({
  queryKey: ["admin", "sales-report", from, to, group],
  enabled,
  queryFn: async (): Promise<SalesReport> => {
    const { data, error } = await supabase.rpc("admin_sales_report", {
      _from: from,
      _to: to,
      _group: group,
    });
    if (error) throw error;
    return data as unknown as SalesReport;
  },
});
