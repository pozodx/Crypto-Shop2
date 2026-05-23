import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";

export function Navbar() {
  const { data: settings } = useGetSettings();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">
              {settings?.shopName?.charAt(0) || "S"}
            </span>
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            {settings?.shopName || "Digital Goods"}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
