import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";

export function Navbar() {
  const { data: settings } = useGetSettings();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ backgroundColor: settings?.bgColor ? `${settings.bgColor}cc` : "rgba(10,10,10,0.8)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.shopName} className="h-7 w-auto object-contain" />
          ) : (
            <span className="font-black text-lg tracking-tight text-white">
              {settings?.shopName || "Store"}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
