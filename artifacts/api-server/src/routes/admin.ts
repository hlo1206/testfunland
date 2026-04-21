import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { UpdateAdminOrderBody } from "@workspace/api-zod";
import { serializeOrder } from "./orders";

const router: IRouter = Router();

function requireAdmin(req: import("express").Request, res: import("express").Response) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

router.get("/admin/orders", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(rows.map(serializeOrder));
});

router.patch("/admin/orders/:orderId", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const parsed = UpdateAdminOrderBody.parse(req.body);
  const orderId = req.params.orderId!;
  const [updated] = await db
    .update(ordersTable)
    .set({
      status: parsed.status,
      adminNote: parsed.adminNote ?? null,
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, orderId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(updated));
});

router.get("/admin/stats", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const allRows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  const totalOrders = allRows.length;
  const pendingOrders = allRows.filter((r) => r.status === "pending").length;
  const deliveredOrders = allRows.filter((r) => r.status === "delivered").length;
  const revenueInr = allRows
    .filter((r) => r.status === "delivered" || r.status === "verified")
    .reduce((sum, r) => sum + r.priceInr, 0);
  const recentOrders = allRows.slice(0, 8).map(serializeOrder);

  res.json({
    totalOrders,
    pendingOrders,
    deliveredOrders,
    revenueInr,
    recentOrders,
  });
  void sql; // keep import in case of future use
});

export default router;
