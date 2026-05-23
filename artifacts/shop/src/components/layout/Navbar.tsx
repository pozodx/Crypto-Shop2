import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetPublicSettings } from "@workspace/api-client-react";
import { DollarSign, ChevronDown, Check } from "lucide-react";
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/contexts/CurrencyContext";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Products", href: "/#products" },
  { label: "Reviews",  href: "/#why" },
  { label: "Status",   href: "/#" },
  { label: "Blog",     href: "/#" },
];

export function Navbar() {
  const { data: settings } = useGetPublicSettings();
  const [location] = useLocation();
  const { currency, setCurrency, symbol } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

        {/* Nav links */}
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

        <div className="flex-1 sm:hidden" />

        {/* Currency picker */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/70 hover:text-white hover:bg-white/12 transition-colors text-xs font-semibold"
            aria-label="Select currency"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{currency}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl shadow-black/60 overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-white/8">
                <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">Select Currency</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {CURRENCIES.map(({ code, symbol: sym, name }) => (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code as CurrencyCode); setDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/8 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center text-sm font-bold text-white/60 group-hover:text-white/80">{sym}</span>
                      <div>
                        <div className="text-xs font-semibold text-white/80 group-hover:text-white">{code}</div>
                        <div className="text-[10px] text-white/30">{name}</div>
                      </div>
                    </div>
                    {currency === code && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
