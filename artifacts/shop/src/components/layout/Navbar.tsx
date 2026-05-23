import { Link, useLocation } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { ShoppingCart, DollarSign } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Products", href: "/#products" },
  { label: "Reviews",  href: "/#why" },
  { label: "Status",   href: "/#" },
  { label: "Blog",     href: "/#" },
];

export function Navbar() {
  const { data: settings } = useGetSettings();
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.shopName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-cyan-500/20 ring-1 ring-cyan-400/30 flex items-center justify-center text-cyan-400 text-xs font-black">
              {(settings?.shopName || "S").charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Nav links — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === "/" ? location === "/" : false;
            return (
              <a
                key={label}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            className="px-4 py-1.5 rounded-full bg-white/8 border border-white/10 text-white text-xs font-semibold hover:bg-white/12 transition-colors"
          >
            Login
          </Link>
          <button className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-colors text-white/70">
            <DollarSign className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-colors text-white/70">
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </nav>
  );
}
