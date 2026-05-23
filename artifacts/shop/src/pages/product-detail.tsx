import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useGetProduct, useGetCryptoRates, useCreateOrder } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Zap, ShieldCheck, Bitcoin, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [cryptoCurrency, setCryptoCurrency] = useState<"BTC" | "ETH">("BTC");

  const { data: product, isLoading: productLoading } = useGetProduct(Number(id));
  const { data: rates } = useGetCryptoRates();
  const createOrder = useCreateOrder();

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Enter your email to receive the product.", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { data: { productId: Number(id), buyerEmail: email, cryptoCurrency } },
      {
        onSuccess: (order) => setLocation(`/order/${order.id}`),
        onError: () => toast({ title: "Error", description: "Failed to create order. Try again.", variant: "destructive" }),
      }
    );
  };

  if (productLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Product not found.</div>
      </div>
    );
  }

  const btcAmount = rates ? (product.priceUsd / rates.btcUsd).toFixed(6) : "–";
  const ethAmount = rates ? (product.priceUsd / rates.ethUsd).toFixed(4) : "–";
  const selectedAmount = cryptoCurrency === "BTC" ? btcAmount : ethAmount;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Product info — 3 cols */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <span className="text-xs font-medium text-primary uppercase tracking-widest">{product.category}</span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1 mb-3 leading-tight">{product.name}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-3 py-4 border-t border-border">
              <span className="text-3xl font-bold font-mono text-foreground">${product.priceUsd.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground font-mono">
                ≈ {btcAmount} BTC / {ethAmount} ETH
              </span>
            </div>

            {product.deliveryNote && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 border border-border">
                {product.deliveryNote}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Zap, label: "Instant delivery" },
                { icon: ShieldCheck, label: "Verified product" },
                { icon: Bitcoin, label: "Crypto payment" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-center">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout — 2 cols */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-5 sticky top-20">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                <p className="text-2xl font-bold font-mono">${product.priceUsd.toFixed(2)}</p>
                <p className="text-xs font-mono text-primary mt-0.5">≈ {selectedAmount} {cryptoCurrency}</p>
              </div>

              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Delivery email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background h-9 text-sm"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Pay with</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["BTC", "ETH"] as const).map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setCryptoCurrency(coin)}
                        className={`rounded-lg border py-3 px-2 text-center transition-all ${
                          cryptoCurrency === coin
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-border/80"
                        }`}
                        data-testid={`button-select-${coin.toLowerCase()}`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {cryptoCurrency === coin && <CheckCircle className="w-3 h-3 text-primary" />}
                          <span className="text-xs font-bold">{coin}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {coin === "BTC" ? btcAmount : ethAmount}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold glow-primary-sm"
                  disabled={createOrder.isPending}
                  data-testid="button-place-order"
                >
                  {createOrder.isPending ? "Processing..." : "Pay with " + cryptoCurrency}
                </Button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center">
                Digital goods revealed instantly after blockchain confirmation
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
