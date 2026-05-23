import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { fetchRates } from "./crypto.js";
import crypto from "crypto";

const router = Router();

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

router.post("/orders", async (req, res) => {
  const { productId, buyerEmail, cryptoCurrency } = req.body as {
    productId: number;
    buyerEmail: string;
    cryptoCurrency: "BTC" | "ETH";
  };

  if (!productId || !buyerEmail || !cryptoCurrency) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);

  if (!product || !product.isActive) {
    res.status(400).json({ error: "Product not found or not available" });
    return;
  }

  const [settings] = await db.select().from(settingsTable).limit(1);

  if (!settings) {
    res.status(400).json({ error: "Shop not configured" });
    return;
  }

  const walletAddress =
    cryptoCurrency === "BTC" ? settings.btcAddress : settings.ethAddress;

  if (!walletAddress) {
    res.status(400).json({ error: `${cryptoCurrency} wallet not configured` });
    return;
  }

  const rates = await fetchRates();
  const rate = cryptoCurrency === "BTC" ? rates.btcUsd : rates.ethUsd;
  const priceUsd = parseFloat(product.priceUsd);
  const cryptoAmount = (priceUsd / rate).toFixed(8);

  const orderId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(ordersTable).values({
    id: orderId,
    productId: product.id,
    productName: product.name,
    buyerEmail,
    cryptoCurrency,
    cryptoAmount,
    walletAddress,
    status: "pending",
    digitalContent: product.digitalContent,
    deliveryNote: product.deliveryNote,
    expiresAt,
  });

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", async (req, res) => {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Auto-expire old pending orders
  if (order.status === "pending" && new Date() > order.expiresAt) {
    await db
      .update(ordersTable)
      .set({ status: "expired" })
      .where(eq(ordersTable.id, order.id));
    order.status = "expired";
  }

  res.json(formatOrder(order));
});

router.post("/orders/:id/verify", async (req, res) => {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status === "completed") {
    res.json(formatOrder(order));
    return;
  }

  if (order.status === "expired" || order.status === "failed") {
    res.json(formatOrder(order));
    return;
  }

  // Check if expired
  if (new Date() > order.expiresAt) {
    await db
      .update(ordersTable)
      .set({ status: "expired" })
      .where(eq(ordersTable.id, order.id));
    order.status = "expired";
    res.json(formatOrder(order));
    return;
  }

  try {
    let paid = false;
    let txHash: string | null = null;

    if (order.cryptoCurrency === "BTC") {
      // Check BTC via Blockstream API
      const response = await fetch(
        `https://blockstream.info/api/address/${order.walletAddress}/txs`,
      );
      if (response.ok) {
        const txs = (await response.json()) as Array<{
          txid: string;
          status: { confirmed: boolean };
          vout: Array<{ scriptpubkey_address: string; value: number }>;
          vin: unknown[];
        }>;
        const expectedSatoshis = Math.round(parseFloat(order.cryptoAmount) * 1e8);
        for (const tx of txs) {
          const received = tx.vout
            .filter((v) => v.scriptpubkey_address === order.walletAddress)
            .reduce((sum, v) => sum + v.value, 0);
          if (received >= expectedSatoshis * 0.99) {
            paid = true;
            txHash = tx.txid;
            break;
          }
        }
      }
    } else if (order.cryptoCurrency === "ETH") {
      // Check ETH via Etherscan public API
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${order.walletAddress}&sort=desc&apikey=YourApiKeyToken`,
      );
      if (response.ok) {
        const data = (await response.json()) as {
          status: string;
          result: Array<{
            hash: string;
            to: string;
            value: string;
            timeStamp: string;
          }>;
        };
        if (data.status === "1" && Array.isArray(data.result)) {
          const expectedWei = BigInt(
            Math.round(parseFloat(order.cryptoAmount) * 1e18),
          );
          const orderTime = order.createdAt.getTime() / 1000;
          for (const tx of data.result) {
            if (
              tx.to.toLowerCase() === order.walletAddress.toLowerCase() &&
              BigInt(tx.value) >= (expectedWei * 99n) / 100n &&
              parseInt(tx.timeStamp) >= orderTime - 300
            ) {
              paid = true;
              txHash = tx.hash;
              break;
            }
          }
        }
      }
    }

    if (paid) {
      await db
        .update(ordersTable)
        .set({
          status: "completed",
          txHash,
          completedAt: new Date(),
        })
        .where(eq(ordersTable.id, order.id));
      const [updated] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, order.id))
        .limit(1);
      res.json(formatOrder(updated));
    } else {
      res.json(formatOrder(order));
    }
  } catch (err) {
    req.log.error({ err }, "Payment verification error");
    res.json(formatOrder(order));
  }
});

export default router;
