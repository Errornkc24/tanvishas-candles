import { Router } from "express";
import { productsController } from "./products.controller.js";

export const productsRoutes = Router();
  productsRoutes.all("/rest/v1/products", productsController);
