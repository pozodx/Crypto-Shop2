import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  shopName: text("shop_name").notNull().default("My Crypto Shop"),
  shopDescription: text("shop_description").notNull().default("Digital goods delivered instantly after crypto payment."),
  btcAddress: text("btc_address").notNull().default(""),
  ethAddress: text("eth_address").notNull().default(""),
  logoUrl: text("logo_url"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
