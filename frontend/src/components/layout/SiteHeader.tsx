import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@/hooks/use-query";
import { Menu, Package, ShoppingBag, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Our Story" },
] as const;

export function SiteHeader() {
  const { count, setOpen, bump } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [pop, setPop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!bump) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 500);
    return () => clearTimeout(t);
  }, [bump]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function signOut() {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 print:hidden transition-all duration-500",
        scrolled ? "border-b bg-background/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="md:hidden" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background">
            <SheetTitle className="flex items-center gap-3 font-brand text-gold">
              <img
                src="/images/logo.webp"
                alt=""
                width={64}
                height={64}
                className="h-14 w-14 rounded-full ring-1 ring-primary/40"
              />
              <span className="flex flex-col">
                <span className="text-xl leading-none">TANVISHAS</span>
                <span className="mt-1 text-[10px] tracking-[0.45em] text-muted-foreground">
                  CANDLES
                </span>
              </span>
            </SheetTitle>
            <nav className="mt-8 flex flex-col gap-5 font-display text-2xl">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-primary"
                >
                  {n.label}
                </Link>
              ))}
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="hover:text-primary">
                My Orders
              </Link>
              <Link to="/account" onClick={() => setMenuOpen(false)} className="hover:text-primary">
                Account
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:static md:translate-x-0 md:translate-y-0 sm:gap-3"
          aria-label="Tanvishas Candles home"
        >
          <img
            src="/images/logo.webp"
            alt=""
            width={56}
            height={56}
            className="h-12 w-12 rounded-full ring-1 ring-primary/40 sm:h-14 sm:w-14"
          />
          <span className="leading-none">
            <span className="block font-brand text-xs text-gold sm:text-lg">TANVISHAS</span>
            <span className="block text-[10px] tracking-[0.5em] text-muted-foreground">
              CANDLES
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.2em] md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-muted-foreground transition-colors hover:text-primary",
                  isActive && "text-primary",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent/60"
                aria-label="Account menu"
              >
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
                  {user.email ?? user.phone}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <User /> My account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package /> My orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Package /> Store admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="whitespace-nowrap rounded-full px-1.5 py-2 text-xs hover:text-primary sm:px-3 sm:text-sm"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-accent/60"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-semibold text-primary-foreground",
                  pop && "animate-cart-pop",
                )}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
