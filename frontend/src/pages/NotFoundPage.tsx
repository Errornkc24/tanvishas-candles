import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-brand text-7xl text-gold">404</h1>
        <h2 className="mt-4 text-2xl">This candle has burned out</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
