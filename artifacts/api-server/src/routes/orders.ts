import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeOrder(r: typeof ordersTable.$inferSelect) {
  return {
    id: r.id,
    productId: r.productId,
    productName: r.productName,
    productCategory: r.productCategory,
    priceInr: r.priceInr,
    minecraftUsername: r.minecraftUsername,
    contact: r.contact ?? null,
    referral: r.referral ?? null,
    paymentMethod: r.paymentMethod as "discord" | "website",
    paymentProofPath: r.paymentProofPath ?? null,
    transactionRef: r.transactionRef ?? null,
    notes: r.notes ?? null,
    status: r.status as "pending" | "verified" | "delivered" | "rejected",
    adminNote: r.adminNote ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.parse(req.body);
  const productRows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.productId))
    .limit(1);
  const product = productRows[0];
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  if (parsed.paymentMethod === "website" && !parsed.paymentProofPath) {
    res.status(400).json({
      error: "Payment screenshot is required when paying via website",
    });
    return;
  }
  const [created] = await db
    .insert(ordersTable)
    .values({
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      priceInr: product.priceInr,
      minecraftUsername: parsed.minecraftUsername,
      contact: parsed.contact ?? null,
      referral: parsed.referral ?? null,
      paymentMethod: parsed.paymentMethod,
      paymentProofPath: parsed.paymentProofPath ?? null,
      transactionRef: parsed.transactionRef ?? null,
      notes: parsed.notes ?? null,
      status: "pending",
    })
    .returning();
  res.json(serializeOrder(created!));
});

export { serializeOrder };
export default router;
