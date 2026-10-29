import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useQueryClient } from "@/hooks/use-query";

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  return (
    <AuthProvider
      onChange={(event) => {
        if (event === "SIGNED_OUT") {
          void queryClient.removeQueries({
            predicate: ({ queryKey }) => queryKey[0] !== "products" && queryKey[0] !== "categories",
          });
        } else {
          void queryClient.invalidateQueries();
        }
      }}
    >
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
