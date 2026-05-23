import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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

export default router;
