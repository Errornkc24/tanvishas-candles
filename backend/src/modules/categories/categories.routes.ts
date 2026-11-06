import { Router } from "express";
import { optionalAuth } from "../../middleware/require-auth.js";
import { validateCategoryMutation } from "./categories.schema.js";
import { categoriesController } from "./categories.controller.js";

export const categoriesRoutes = Router();
categoriesRoutes.all("/rest/v1/categories", optionalAuth, validateCategoryMutation, categoriesController);
