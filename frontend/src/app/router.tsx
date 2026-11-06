import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { PageHead } from "@/components/PageHead";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { Home } from "@/pages/HomePage";
import { Shop } from "@/pages/ShopPage";
import { ProductPage } from "@/pages/ProductPage";
import { About } from "@/pages/AboutPage";
import { AuthPage } from "@/pages/AuthPage";
import { Reset } from "@/pages/ResetPasswordPage";
import { CartPage } from "@/pages/CartPage";
import { Account } from "@/pages/account/AccountPage";
import { Checkout } from "@/pages/checkout/CheckoutPage";
import { Orders } from "@/pages/orders/OrdersPage";
import { OrderDetail as CustomerOrderDetail } from "@/pages/orders/OrderDetailPage";
import { AdminRoute } from "@/app/AdminRoute";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Dashboard } from "@/pages/admin/DashboardPage";
import { Sales } from "@/pages/admin/SalesPage";
import { Orders as AdminOrders } from "@/pages/admin/OrdersPage";
import { OrderDetail as AdminOrderDetail } from "@/pages/admin/OrderDetailPage";
import { Products } from "@/pages/admin/ProductsPage";
import { Categories } from "@/pages/admin/CategoriesPage";
import { StockHistory } from "@/pages/admin/StockPage";
import { Team } from "@/pages/admin/TeamPage";

function AppLayout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <AmbientBackground fixed density={0.8} className="opacity-70 print:hidden" />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <div className="relative z-10 print:hidden">
          <SiteFooter />
        </div>
      </div>
      <CartDrawer />
      <Toaster position="top-center" theme="light" richColors />
    </>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <>
              <PageHead
                title="Hand-poured scented candles"
                description="Luxury hand-poured soy candles from India. Light up your moments."
              />
              <Home />
            </>
          }
        />
        <Route
          path="shop"
          element={
            <>
              <PageHead
                title="Shop candles"
                description="Explore hand-poured soy candles in floral, woody and warm Indian-inspired scents."
              />
              <Shop />
            </>
          }
        />
        <Route
          path="product/:slug"
          element={
            <>
              <PageHead
                title="Scented candle"
                description="Discover a hand-poured Tanvishas candle."
              />
              <ProductPage />
            </>
          }
        />
        <Route
          path="about"
          element={
            <>
              <PageHead
                title="Our story"
                description="Learn about Tanvishas Candles and our hand-poured soy wax candles."
              />
              <About />
            </>
          }
        />
        <Route
          path="auth"
          element={
            <>
              <PageHead
                title="Sign in"
                description="Sign in or create a Tanvishas Candles account."
              />
              <AuthPage />
            </>
          }
        />
        <Route
          path="reset-password"
          element={
            <>
              <PageHead
                title="Reset password"
                description="Choose a new password for your account."
                privatePage
              />
              <Reset />
            </>
          }
        />
        <Route
          path="cart"
          element={
            <>
              <PageHead title="Your Cart" description="Review the candles in your cart." />
              <CartPage />
            </>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="account"
            element={
              <>
                <PageHead
                  title="Your account"
                  description="Manage your profile and saved addresses."
                  privatePage
                />
                <Account />
              </>
            }
          />
          <Route
            path="checkout"
            element={
              <>
                <PageHead
                  title="Checkout"
                  description="Choose a delivery address and place your order."
                  privatePage
                />
                <Checkout />
              </>
            }
          />
          <Route
            path="orders"
            element={
              <>
                <PageHead
                  title="Your orders"
                  description="Review your candle orders."
                  privatePage
                />
                <Orders />
              </>
            }
          />
          <Route
            path="orders/:id"
            element={
              <>
                <PageHead
                  title="Order details"
                  description="View your order status and details."
                  privatePage
                />
                <CustomerOrderDetail />
              </>
            }
          />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route
                index
                element={
                  <>
                    <PageHead
                      title="Store dashboard"
                      description="View sales, recent orders and low-stock candles."
                      privatePage
                    />
                    <Dashboard />
                  </>
                }
              />
              <Route
                path="sales"
                element={
                  <>
                    <PageHead
                      title="Sales reports"
                      description="Daily, monthly and yearly candle sales, payments and product performance."
                      privatePage
                    />
                    <Sales />
                  </>
                }
              />
              <Route
                path="orders"
                element={
                  <>
                    <PageHead
                      title="Manage orders"
                      description="Review and filter customer candle orders."
                      privatePage
                    />
                    <AdminOrders />
                  </>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <>
                    <PageHead
                      title="Manage order details"
                      description="Manage order status, shipping and customer details."
                      privatePage
                    />
                    <AdminOrderDetail />
                  </>
                }
              />
              <Route
                path="products"
                element={
                  <>
                    <PageHead
                      title="Manage candles"
                      description="Manage candle listings, prices, photos and inventory."
                      privatePage
                    />
                    <Products />
                  </>
                }
              />
              <Route
                path="categories"
                element={
                  <>
                    <PageHead
                      title="Manage categories"
                      description="Organize candle categories for the store."
                      privatePage
                    />
                    <Categories />
                  </>
                }
              />
              <Route
                path="stock"
                element={
                  <>
                    <PageHead
                      title="Stock history"
                      description="Review candle stock adjustments and sales history."
                      privatePage
                    />
                    <StockHistory />
                  </>
                }
              />
              <Route
                path="team"
                element={
                  <>
                    <PageHead
                      title="Store team"
                      description="Manage owner and staff access to the candle store."
                      privatePage
                    />
                    <Team />
                  </>
                }
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
