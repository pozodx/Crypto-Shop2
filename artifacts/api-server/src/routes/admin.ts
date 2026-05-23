import { Router, type Request, type Response, type NextFunction } from "express";
import { createHmac } from "crypto";
import { db } from "@workspace/db";
import { productsTable, ordersTable, settingsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const TOKEN_SECRET = process.env.SESSION_SECRET || "fallback-secret";

function computeToken(pw: string): string {
  return createHmac("sha256", TOKEN_SECRET).update(pw).digest("hex");
}

const VALID_TOKEN = computeToken(ADMIN_PASSWORD);

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (auth.slice(7) !== VALID_TOKEN) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  next();
}

// Public: admin login
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password || computeToken(password) !== VALID_TOKEN) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  res.json({ token: VALID_TOKEN });
});

// All routes below this line require auth
router.use(requireAuth);

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    productId: o.productId,
    productName: o.productName,
    buyerEmail: o.buyerEmail,
    cryptoCurrency: o.cryptoCurrency,
    cryptoAmount: o.cryptoAmount,
    walletAddress: o.walletAddress,
    txHash: o.txHash,
    status: o.status,
    digitalContent: o.digitalContent,
    deliveryNote: o.deliveryNote,
    expiresAt: o.expiresAt.toISOString(),
    createdAt: o.createdAt.toISOString(),
    completedAt: o.completedAt ? o.completedAt.toISOString() : null,
  };
}

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
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
  };
}

router.get("/admin/stats", async (req, res) => {
  const [totalOrdersRow] = await db
    .select({ count: count() })
    .from(ordersTable);
  const [pendingRow] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));
  const [completedRow] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "completed"));

  const revenueResult = await db
    .select({ total: sql<string>`COALESCE(SUM(CAST(crypto_amount AS NUMERIC)), 0)` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "completed"));

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  res.json({
    totalRevenue: parseFloat(revenueResult[0].total ?? "0"),
    totalOrders: totalOrdersRow.count,
    pendingOrders: pendingRow.count,
    completedOrders: completedRow.count,
    recentOrders: recentOrders.map(formatOrder),
  });
});

router.get("/admin/products", async (req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt));
  res.json(products.map(formatProduct));
});

router.post("/admin/products", async (req, res) => {
  const {
    name,
    description,
    priceUsd,
    imageUrl,
    category,
    isActive,
    stock,
    digitalContent,
    deliveryNote,
  } = req.body as {
    name: string;
    description: string;
    priceUsd: number;
    imageUrl?: string;
    category: string;
    isActive?: boolean;
    stock?: number;
    digitalContent?: string;
    deliveryNote?: string;
  };

  const [product] = await db
    .insert(productsTable)
    .values({
      name,
      description,
      priceUsd: String(priceUsd),
      imageUrl: imageUrl ?? null,
      category: category ?? "Digital",
      isActive: isActive ?? true,
      stock: stock ?? null,
      digitalContent: digitalContent ?? null,
      deliveryNote: deliveryNote ?? null,
    })
    .returning();

  res.status(201).json(formatProduct(product));
});

router.put("/admin/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const {
    name,
    description,
    priceUsd,
    imageUrl,
    category,
    isActive,
    stock,
    digitalContent,
    deliveryNote,
  } = req.body as Partial<{
    name: string;
    description: string;
    priceUsd: number;
    imageUrl: string | null;
    category: string;
    isActive: boolean;
    stock: number | null;
    digitalContent: string | null;
    deliveryNote: string | null;
  }>;

  const updateData: Partial<typeof productsTable.$inferInsert> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (priceUsd !== undefined) updateData.priceUsd = String(priceUsd);
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (category !== undefined) updateData.category = category;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (stock !== undefined) updateData.stock = stock;
  if (digitalContent !== undefined) updateData.digitalContent = digitalContent;
  if (deliveryNote !== undefined) updateData.deliveryNote = deliveryNote;

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.delete("/admin/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

router.get("/admin/orders", async (req, res) => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(orders.map(formatOrder));
});

router.get("/admin/settings", async (req, res) => {
  let [settings] = await db.select().from(settingsTable).limit(1);

  if (!settings) {
    [settings] = await db
      .insert(settingsTable)
      .values({
        shopName: "My Crypto Shop",
        shopDescription: "Digital goods delivered instantly after crypto payment.",
        heroTitle: "Premium Quality, Smart Prices",
        heroSubtitle: "Great products don't have to be expensive. We deliver high quality digital goods at honest prices.",
        heroBadge: "INSTANT DELIVERY",
        bgColor: "#0a0a0a",
        accentColor: "#ffffff",
        btcAddress: "",
        ethAddress: "",
      })
      .returning();
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

router.put("/admin/settings", async (req, res) => {
  const {
    shopName, shopDescription, heroTitle, heroSubtitle, heroBadge,
    bgColor, accentColor, btcAddress, ethAddress, logoUrl,
  } = req.body as {
    shopName?: string;
    shopDescription?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroBadge?: string;
    bgColor?: string;
    accentColor?: string;
    btcAddress?: string;
    ethAddress?: string;
    logoUrl?: string | null;
  };

  let [settings] = await db.select().from(settingsTable).limit(1);

  if (!settings) {
    [settings] = await db
      .insert(settingsTable)
      .values({
        shopName: shopName ?? "My Crypto Shop",
        shopDescription: shopDescription ?? "",
        heroTitle: heroTitle ?? "Premium Quality, Smart Prices",
        heroSubtitle: heroSubtitle ?? "",
        heroBadge: heroBadge ?? "INSTANT DELIVERY",
        bgColor: bgColor ?? "#0a0a0a",
        accentColor: accentColor ?? "#ffffff",
        btcAddress: btcAddress ?? "",
        ethAddress: ethAddress ?? "",
        logoUrl: logoUrl ?? null,
      })
      .returning();
  } else {
    const updateData: Partial<typeof settingsTable.$inferInsert> = {};
    if (shopName !== undefined) updateData.shopName = shopName;
    if (shopDescription !== undefined) updateData.shopDescription = shopDescription;
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle;
    if (heroBadge !== undefined) updateData.heroBadge = heroBadge;
    if (bgColor !== undefined) updateData.bgColor = bgColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (btcAddress !== undefined) updateData.btcAddress = btcAddress;
    if (ethAddress !== undefined) updateData.ethAddress = ethAddress;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    [settings] = await db
      .update(settingsTable)
      .set(updateData)
      .where(eq(settingsTable.id, settings.id))
      .returning();
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

export default router;
