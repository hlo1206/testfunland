import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  uuid,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  priceInr: integer("price_inr").notNull(),
  tagline: text("tagline"),
  coins: integer("coins"),
  rankTier: text("rank_tier"),
  unbanDuration: text("unban_duration"),
  accent: text("accent"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  productCategory: text("product_category").notNull(),
  priceInr: integer("price_inr").notNull(),
  minecraftUsername: text("minecraft_username").notNull(),
  contact: text("contact"),
  referral: text("referral"),
  paymentMethod: text("payment_method").notNull(),
  paymentProofPath: text("payment_proof_path"),
  transactionRef: text("transaction_ref"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serverStatusTable = pgTable("server_status", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("online"),
  playersOnline: integer("players_online").notNull().default(0),
  maxPlayers: integer("max_players").notNull().default(200),
  ip: text("ip").notNull().default("play.funlandmc.fun"),
  port: integer("port").notNull().default(19132),
  version: text("version").notNull().default("1.16+ to 1.21.11"),
  message: text("message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminUsersTable = pgTable("admin_users", {
  email: text("email").primaryKey(),
});

export const specialOffersTable = pgTable("special_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  badgeText: text("badge_text"),
  discountPercent: integer("discount_percent"),
  active: text("active").notNull().default("true"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof productsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type ServerStatusRow = typeof serverStatusTable.$inferSelect;
export type SpecialOffer = typeof specialOffersTable.$inferSelect;
