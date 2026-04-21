import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { ListProductsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder));
  const body = rows.map((r) => ({
    id: r.id,
    category: r.category as "coins" | "rank" | "unban",
    name: r.name,
    priceInr: r.priceInr,
    tagline: r.tagline ?? null,
    coins: r.coins ?? null,
    rankTier: r.rankTier ?? null,
    unbanDuration: r.unbanDuration ?? null,
    accent: r.accent ?? null,
    sortOrder: r.sortOrder,
  }));
  res.json(ListProductsResponse.parse(body));
});

export default router;
