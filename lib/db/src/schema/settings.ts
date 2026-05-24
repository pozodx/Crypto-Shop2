import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  shopName: text("shop_name").notNull().default("My Crypto Shop"),
  shopDescription: text("shop_description").notNull().default("Digital goods delivered instantly after crypto payment."),
  heroTitle: text("hero_title").notNull().default("Premium Quality, Smart Prices"),
  heroSubtitle: text("hero_subtitle").notNull().default("Great products don't have to be expensive. We deliver high quality digital goods at honest prices."),
  heroBadge: text("hero_badge").notNull().default("INSTANT DELIVERY"),
  bgColor: text("bg_color").notNull().default("#0a0a0a"),
  accentColor: text("accent_color").notNull().default("#ffffff"),
  btcAddress: text("btc_address").notNull().default(""),
  ethAddress: text("eth_address").notNull().default(""),
  logoUrl: text("logo_url"),
  // Hero stat overrides — null means "use real data"
  statFeedback: text("stat_feedback"),
  statSold: text("stat_sold"),
  statCustomers: text("stat_customers"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
