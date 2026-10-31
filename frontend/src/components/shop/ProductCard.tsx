import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR, type Product } from "@/lib/shop-helpers";
import { StockBadge } from "./StockBadge";
import { QtyStepper } from "./CartDrawer";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function ProductCard({ product }: { product: Product }) {
  const { add, lines, setQty } = useCart();
  const out = product.stock <= 0;
  const cartLine = lines.find((line) => line.productId === product.id);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card-gradient text-center shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        <img
          src={product.images[0]}
          alt={`${product.name} scented candle`}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <StockBadge stock={product.stock} className="absolute left-3 top-3" />
      </Link>
      <div className="flex flex-1 flex-col items-center gap-2 p-4 sm:p-5">
        <Link to={`/product/${product.slug}`} className="flex w-full justify-center">
          <h3 className="line-clamp-2 flex min-h-14 items-center justify-center text-xl leading-tight transition-colors group-hover:text-primary sm:text-2xl">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-medium text-muted-foreground">Handmade candles</p>
        <p className="min-h-5 text-sm font-medium text-foreground/80">
          {product.size || product.short_description}
        </p>
        <span className="font-brand text-lg font-semibold text-primary">
          {formatINR(Number(product.price))}
        </span>
        <div className="mt-auto flex w-full justify-center pt-2">
          {out ? (
            <Button size="sm" variant="secondary" disabled>
              Sold out
            </Button>
          ) : cartLine ? (
            <QtyStepper
              value={cartLine.quantity}
              max={product.stock}
              onChange={(quantity) => setQty(product.id, quantity)}
              label={product.name}
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => add(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag /> Add to cart
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-square w-full rounded-none bg-muted" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-2/3 bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-8 w-full bg-muted" />
      </div>
    </div>
  );
}
