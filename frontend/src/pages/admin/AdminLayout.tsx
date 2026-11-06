import { Link, NavLink, Outlet } from "react-router-dom";
import { useQuery, useQueryClient } from "@/hooks/use-query";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Bell,
  Boxes,
  ChartNoAxesCombined,
  History,
  LayoutDashboard,
  Package,
  Tags,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminDashboardQuery } from "@/services/admin.service";
import { useRoles } from "@/hooks/useAdmin";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AdminLayout() {
  const { data: roles } = useRoles();
  return <AdminShell isOwner={!!roles?.includes("owner")} />;
}

function AdminShell({ isOwner }: { isOwner: boolean }) {
  const qc = useQueryClient();
  const { data: dashboard } = useQuery(adminDashboardQuery);
  const low = dashboard?.low_stock ?? [];

  useEffect(() => {
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (p) => {
        toast.success(`New order ${(p.new as { order_number?: string }).order_number ?? ""}`);
        qc.invalidateQueries({ queryKey: ["admin"] });
      })
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [qc]);

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/sales", label: "Sales", icon: ChartNoAxesCombined },
    { to: "/admin/orders", label: "Orders", icon: Package },
    { to: "/admin/products", label: "Products", icon: Boxes },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/stock", label: "Stock history", icon: History },
    ...(isOwner ? [{ to: "/admin/team", label: "Team", icon: Users }] : []),
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-4xl">Store admin</h1>
        <Popover>
          <PopoverTrigger
            className="relative grid h-10 w-10 place-items-center rounded-full border hover:bg-accent/60"
            aria-label={`Low stock alerts, ${low.length}`}
          >
            <Bell className="h-5 w-5" />
            {low.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] text-destructive-foreground">
                {low.length}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <p className="mb-2 font-medium">Low stock</p>
            {low.length === 0 ? (
              <p className="text-sm text-muted-foreground">All candles are well stocked.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {low.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span className="truncate">{p.name}</span>
                    <span className={p.stock === 0 ? "text-destructive" : "text-primary"}>
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/products" className="mt-3 block text-sm text-primary">
              Manage stock →
            </Link>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col print:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={"exact" in l}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50",
                  isActive && "bg-primary/15 text-primary",
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
