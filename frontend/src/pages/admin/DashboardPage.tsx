import { Link } from "react-router-dom";
import { useQuery } from "@/hooks/use-query";
import {
  adminDashboardQuery,
  contactOf,
  fmtDate,
} from "@/services/admin.service";
import { formatINR, STATUS_LABEL } from "@/lib/shop-helpers";

export function Dashboard() {
  const { data: summary } = useQuery(adminDashboardQuery);
  const orders = summary?.recent_orders ?? [];
  const low = summary?.low_stock ?? [];

  const stats = [
    { label: "Orders today", value: summary?.orders_today ?? 0 },
    { label: "Sales today", value: formatINR(summary?.sales_today ?? 0) },
    { label: "Sales this month", value: formatINR(summary?.sales_this_month ?? 0) },
    { label: "To pack & ship", value: summary?.to_pack_count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card/60 p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl text-gold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border bg-card/60 p-5">
          <div className="flex justify-between">
            <h2 className="text-2xl">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary">
              View all
            </Link>
          </div>
          {summary && orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <span>
                      <span className="font-medium">{o.order_number}</span> ·{" "}
                      {contactOf(o).first_name} {contactOf(o).last_name}
                      <span className="block text-xs text-muted-foreground">
                        {fmtDate(o.created_at)}
                      </span>
                    </span>
                    <span className="text-right">
                      {formatINR(Number(o.total))}
                      <span className="block text-xs text-muted-foreground">
                        {STATUS_LABEL[o.status]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border bg-card/60 p-5">
          <h2 className="text-2xl">Low stock</h2>
          {low.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Everything is well stocked.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {low.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? "text-destructive" : "text-primary"}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
