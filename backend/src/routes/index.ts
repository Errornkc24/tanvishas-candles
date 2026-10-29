import express, { Router } from "express";
import { productsRoutes } from "../modules/products/products.routes.js";
import { categoriesRoutes } from "../modules/categories/categories.routes.js";
import { accountRoutes } from "../modules/account/account.routes.js";
import { cartRoutes } from "../modules/cart/cart.routes.js";
import { ordersRoutes } from "../modules/orders/orders.routes.js";
import { stockRoutes } from "../modules/stock/stock.routes.js";
import { teamRoutes } from "../modules/team/team.routes.js";
import { adminRoutes } from "../modules/admin/admin.routes.js";
import { paymentRoutes } from "../modules/payments/payments.routes.js";
import { salesRoutes } from "../modules/sales/sales.routes.js";

export const databaseRoutes = Router();
databaseRoutes.use(express.raw({ type: "application/json", limit: "2mb" }));
databaseRoutes.use(productsRoutes);
databaseRoutes.use(categoriesRoutes);
databaseRoutes.use(accountRoutes);
databaseRoutes.use(cartRoutes);
databaseRoutes.use(ordersRoutes);
databaseRoutes.use(stockRoutes);
databaseRoutes.use(teamRoutes);
databaseRoutes.use(adminRoutes);

export { paymentRoutes };
export { salesRoutes };
