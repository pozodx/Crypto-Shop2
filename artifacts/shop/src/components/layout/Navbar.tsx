import { Link } from "wouter";
import { useGetSettings, useGetCryptoRates } from "@workspace/api-client-react";

export function Navbar() {
  const { data: settings } = useGetSettings();
  const { data: rates } = useGetCryptoRates();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-black text-sm leading-none">
              {settings?.shopName?.charAt(0) || "S"}
            </span>
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            {settings?.shopName || "CryptoStore"}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {rates && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                BTC <span className="text-foreground">${rates.btcUsd.toLocaleString()}</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
                ETH <span className="text-foreground">${rates.ethUsd.toLocaleString()}</span>
              </span>
            </div>
          )}
          <Link
            href="/admin"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
