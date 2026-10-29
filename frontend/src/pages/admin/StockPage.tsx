import { useQuery } from "@/hooks/use-query";
import { useState } from "react";
import { adminProductsQuery, fmtDate } from "@/services/admin.service";
import { stockHistoryQuery } from "@/services/stock.service";

const REASON: Record<string, string> = {
  order: "Order",
  order_cancelled: "Order cancelled",
  initial: "Starting stock",
};

export function StockHistory() {
  const [pid, setPid] = useState("");
  const { data: products = [] } = useQuery(adminProductsQuery);
  const { data: rows = [] } = useQuery(stockHistoryQuery(pid || undefined));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-3xl">Stock history</h2>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={pid}
          onChange={(e) => setPid(e.target.value)}
        >
          <option value="">All candles</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card/60">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Candle</th>
              <th className="p-3">Change</th>
              <th className="p-3">New stock</th>
              <th className="p-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No stock changes yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                <td className="p-3">{r.products?.name}</td>
                <td className={`p-3 ${r.change > 0 ? "text-primary" : "text-destructive"}`}>
                  {r.change > 0 ? `+${r.change}` : r.change}
                </td>
                <td className="p-3">{r.new_stock}</td>
                <td className="p-3">
                  {REASON[r.reason] ?? r.reason[0].toUpperCase() + r.reason.slice(1)}
                  {r.note && <span className="block text-xs text-muted-foreground">{r.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
