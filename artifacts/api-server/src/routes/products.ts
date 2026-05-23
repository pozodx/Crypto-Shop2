import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, ordersTable, settingsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .orderBy(productsTable.createdAt);

  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceUsd: parseFloat(p.priceUsd),
      imageUrl: p.imageUrl,
      category: p.category,
      isActive: p.isActive,
      stock: p.stock,
      deliveryNote: p.deliveryNote,
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    priceUsd: parseFloat(product.priceUsd),
    imageUrl: product.imageUrl,
    category: product.category,
    isActive: product.isActive,
    stock: product.stock,
    deliveryNote: product.deliveryNote,
    createdAt: product.createdAt.toISOString(),
  });
});

router.get("/settings", async (_req, res) => {
  let [settings] = await db.select().from(settingsTable).limit(1);
  if (!settings) {
    [settings] = await db.insert(settingsTable).values({
      shopName: "My Crypto Shop",
      shopDescription: "Digital goods delivered instantly after crypto payment.",
      heroTitle: "Premium Quality, Smart Prices",
      heroSubtitle: "Great products don't have to be expensive. We deliver high quality digital goods at honest prices.",
      heroBadge: "INSTANT DELIVERY",
      bgColor: "#0a0a0a",
      accentColor: "#ffffff",
      btcAddress: "",
      ethAddress: "",
    }).returning();
  }
  res.json({
    shopName: settings.shopName,
    shopDescription: settings.shopDescription,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroBadge: settings.heroBadge,
    bgColor: settings.bgColor,
    accentColor: settings.accentColor,
    btcAddress: settings.btcAddress,
    ethAddress: settings.ethAddress,
    logoUrl: settings.logoUrl,
  });
});

router.get("/stats", async (_req, res) => {
  const [total] = await db.select({ value: count() }).from(ordersTable);
  const [completed] = await db.select({ value: count() }).from(ordersTable).where(eq(ordersTable.status, "completed"));
  res.json({
    totalOrders: total?.value ?? 0,
    completedOrders: completed?.value ?? 0,
  });
});

export default router;
