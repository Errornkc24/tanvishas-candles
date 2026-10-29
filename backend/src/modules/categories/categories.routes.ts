import { Router } from "express";
import { categoriesController } from "./categories.controller.js";

export const categoriesRoutes = Router();
  categoriesRoutes.all("/rest/v1/categories", categoriesController);
