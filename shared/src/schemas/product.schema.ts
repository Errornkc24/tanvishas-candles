import type { Database } from "../database.types.js";

export type ProductSummary = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "slug" | "short_description" | "price" | "stock" | "images" | "featured" | "bestseller"
>;
