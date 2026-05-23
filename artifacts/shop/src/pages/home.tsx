import { useGetSettings, useListProducts, useGetCryptoRates } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, Package, Star } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Software: "text-blue-400 bg-blue-400/10",
  Accounts: "text-purple-400 bg-purple-400/10",
  Proxies: "text-amber-400 bg-amber-400/10",
  Keys: "text-green-400 bg-green-400/10",
  Games: "text-rose-400 bg-rose-400/10",
  Digital: "text-primary bg-primary/10",
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] || "text-primary bg-primary/10";
}

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: rates } = useGetCryptoRates();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block status-pulse"></span>
            Instant crypto delivery
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {settings?.shopName || "Digital Goods"}
          </h1>
          <p className="text-muted-foreground max-w-xl text-base">
            {settings?.shopDescription || "Buy software, keys, and digital assets. Pay with Bitcoin or Ethereum — delivered instantly on-chain."}
          </p>
        </div>

        {/* Product grid */}
        <div className="space-y-2">
          {productsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer h-20 rounded-lg" />
            ))
          ) : products?.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No products available yet.</p>
            </div>
          ) : (
            products?.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div
                  className="product-card group flex items-center gap-4 p-4 sm:p-5 rounded-lg border border-border bg-card hover:bg-card/80 transition-all duration-200 cursor-pointer"
                  data-testid={`card-product-${product.id}`}
                >
                  {/* Category icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getCategoryStyle(product.category)}`}>
                    <Star className="w-4 h-4" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground truncate">{product.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 h-4 shrink-0 border-0 ${getCategoryStyle(product.category)}`}
                      >
                        {product.category}
                      </Badge>
                      {product.stock !== null && product.stock !== undefined && product.stock <= 5 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 border-0 text-amber-400 bg-amber-400/10">
                          {product.stock} left
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-foreground">${product.priceUsd.toFixed(2)}</div>
                    {rates && (
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {(product.priceUsd / rates.btcUsd).toFixed(5)} BTC
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer note */}
        {!productsLoading && (products?.length ?? 0) > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            All products delivered automatically after payment confirmation on-chain.
          </p>
        )}
      </main>
    </div>
  );
}
