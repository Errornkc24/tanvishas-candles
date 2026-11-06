import { Router } from "express";
import { optionalAuth } from "../../middleware/require-auth.js";
import { validateProductMutation } from "./products.schema.js";
import { productsController } from "./products.controller.js";

export const productsRoutes = Router();
productsRoutes.all("/rest/v1/products", optionalAuth, validateProductMutation, productsController);
