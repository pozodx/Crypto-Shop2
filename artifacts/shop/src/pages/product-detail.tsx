import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetProduct, useGetCryptoRates, useCreateOrder } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [cryptoCurrency, setCryptoCurrency] = useState<"BTC" | "ETH">("BTC");

  const { data: product, isLoading: productLoading } = useGetProduct(Number(id));
  const { data: rates, isLoading: ratesLoading } = useGetCryptoRates();
  const createOrder = useCreateOrder();

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email to receive the product.", variant: "destructive" });
      return;
    }
    
    createOrder.mutate(
      { data: { productId: Number(id), buyerEmail: email, cryptoCurrency } },
      {
        onSuccess: (order) => {
          setLocation(`/order/${order.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
        }
      }
    );
  };

  const isLoading = productLoading || ratesLoading;

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Skeleton className="h-96 w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Product not found.</p>
        </div>
      </div>
    );
  }

  const btcAmount = rates ? (product.priceUsd / rates.btcUsd).toFixed(6) : "0";
  const ethAmount = rates ? (product.priceUsd / rates.ethUsd).toFixed(4) : "0";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left Column: Product Info */}
          <div className="space-y-8">
            {product.imageUrl ? (
              <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-muted aspect-[4/3]">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card aspect-[4/3] flex items-center justify-center shadow-lg">
                <span className="text-6xl text-muted-foreground/30 font-bold">{product.name.charAt(0)}</span>
              </div>
            )}
            
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                <div className="text-3xl font-mono text-primary">${product.priceUsd.toFixed(2)}</div>
              </div>
              
              <div className="prose prose-invert max-w-none text-muted-foreground">
                {product.description}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card border border-border">
                <Zap className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Instant Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card border border-border">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Verified Product</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card border border-border">
                <Lock className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Secure Crypto</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form */}
          <div>
            <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur sticky top-8">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-bold">Complete Purchase</h3>
                
                <form onSubmit={handlePurchase} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Delivery Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background"
                      data-testid="input-email"
                    />
                    <p className="text-xs text-muted-foreground">
                      The digital goods will be sent to this address.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <Label>Select Payment Method</Label>
                    <RadioGroup value={cryptoCurrency} onValueChange={(v) => setCryptoCurrency(v as "BTC" | "ETH")} className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="BTC" id="btc" className="peer sr-only" />
                        <Label
                          htmlFor="btc"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                        >
                          <span className="text-lg font-bold mb-2">Bitcoin</span>
                          <span className="text-sm font-mono text-muted-foreground">≈ {btcAmount} BTC</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="ETH" id="eth" className="peer sr-only" />
                        <Label
                          htmlFor="eth"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                        >
                          <span className="text-lg font-bold mb-2">Ethereum</span>
                          <span className="text-sm font-mono text-muted-foreground">≈ {ethAmount} ETH</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg" 
                    disabled={createOrder.isPending}
                    data-testid="button-place-order"
                  >
                    {createOrder.isPending ? "Creating Order..." : "Proceed to Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
