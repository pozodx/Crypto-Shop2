import { Router } from "express";

const router = Router();

let ratesCache: { btcUsd: number; ethUsd: number; updatedAt: string } | null = null;
let cacheExpiry = 0;

async function fetchRates() {
  if (ratesCache && Date.now() < cacheExpiry) {
    return ratesCache;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
    );
    if (!response.ok) throw new Error("Failed to fetch rates");
    const data = (await response.json()) as {
      bitcoin: { usd: number };
      ethereum: { usd: number };
    };
    ratesCache = {
      btcUsd: data.bitcoin.usd,
      ethUsd: data.ethereum.usd,
      updatedAt: new Date().toISOString(),
    };
    cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 min cache
    return ratesCache;
  } catch {
    // Fallback rates if API is down
    return {
      btcUsd: 65000,
      ethUsd: 3500,
      updatedAt: new Date().toISOString(),
    };
  }
}

router.get("/crypto/rates", async (req, res) => {
  const rates = await fetchRates();
  res.json(rates);
});

export { fetchRates };
export default router;
