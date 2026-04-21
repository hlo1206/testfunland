import { Router, type IRouter } from "express";
import { db, serverStatusTable } from "@workspace/db";
import { GetServerStatusResponse, UpdateServerStatusBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getOrCreateStatus() {
  const rows = await db.select().from(serverStatusTable).limit(1);
  if (rows.length > 0) return rows[0]!;
  const [created] = await db
    .insert(serverStatusTable)
    .values({})
    .returning();
  return created!;
}

router.get("/server-status", async (_req, res) => {
  const row = await getOrCreateStatus();
  const body = {
    status: row.status as "online" | "offline" | "maintenance",
    playersOnline: row.playersOnline,
    maxPlayers: row.maxPlayers,
    ip: row.ip,
    port: row.port,
    version: row.version,
    message: row.message ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
  res.json(GetServerStatusResponse.parse(body));
});

router.put("/server-status", async (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const parsed = UpdateServerStatusBody.parse(req.body);
  const current = await getOrCreateStatus();
  const [updated] = await db
    .update(serverStatusTable)
    .set({
      status: parsed.status ?? current.status,
      playersOnline: parsed.playersOnline ?? current.playersOnline,
      maxPlayers: parsed.maxPlayers ?? current.maxPlayers,
      ip: parsed.ip ?? current.ip,
      port: parsed.port ?? current.port,
      version: parsed.version ?? current.version,
      message: parsed.message ?? current.message,
      updatedAt: new Date(),
    })
    .where(eq(serverStatusTable.id, current.id))
    .returning();
  const body = {
    status: updated!.status as "online" | "offline" | "maintenance",
    playersOnline: updated!.playersOnline,
    maxPlayers: updated!.maxPlayers,
    ip: updated!.ip,
    port: updated!.port,
    version: updated!.version,
    message: updated!.message ?? null,
    updatedAt: updated!.updatedAt.toISOString(),
  };
  res.json(body);
});

export default router;
