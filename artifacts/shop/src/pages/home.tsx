import { useGetSettings, useListProducts, useGetCryptoRates } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: settings, isLoading: settingsLoading } = useGetSettings();
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: rates, isLoading: ratesLoading } = useGetCryptoRates();

  const isLoading = settingsLoading || productsLoading || ratesLoading;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            {settings?.shopName || "Digital Goods"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {settings?.shopDescription || "Buy software, keys, and digital assets securely with crypto."}
          </p>
          
          {rates && (
            <div className="inline-flex gap-4 p-3 mt-4 rounded-full bg-card border border-border shadow-sm items-center">
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium text-sm">BTC</span>
                <span className="text-sm font-mono">${rates.btcUsd.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium text-sm">ETH</span>
                <span className="text-sm font-mono">${rates.ethUsd.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col h-full bg-card/50 border-border/50">
                <Skeleton className="h-48 w-full rounded-t-xl" />
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            products?.map((product) => (
              <Card key={product.id} className="flex flex-col h-full bg-card border-border hover:border-primary/50 transition-colors group overflow-hidden">
                {product.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center border-b border-border">
                    <span className="text-muted-foreground text-4xl font-bold opacity-20">{product.name.charAt(0)}</span>
                  </div>
                )}
                
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-xl leading-tight line-clamp-1">{product.name}</h3>
                      <Badge variant="secondary" className="mt-2">{product.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-2 flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-2">{product.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-bold font-mono text-primary">${product.priceUsd.toFixed(2)}</div>
                      {rates && (
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          ≈ {(product.priceUsd / rates.btcUsd).toFixed(6)} BTC
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <Link href={`/product/${product.id}`} className="w-full block">
                    <Button className="w-full font-semibold" data-testid={`button-buy-${product.id}`}>
                      Purchase Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
          
          {!isLoading && products?.length === 0 && (
            <div className="col-span-full py-24 text-center text-muted-foreground">
              No products available at the moment.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
