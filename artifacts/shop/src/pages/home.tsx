import { useState, useMemo } from "react";
import { useGetSettings, useListProducts, useGetCryptoRates, useGetAdminStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Search, Zap, Headphones, DollarSign, Shield, Smile, PackageCheck, Star, ShoppingBag, Users } from "lucide-react";
import starsBg from "@assets/126e7fc4a5bf81259c606d121a00cc0b_1779553459078.jpg";

const CATEGORY_GRADIENT: Record<string, string> = {
  Software: "from-blue-950 to-blue-900",
  Accounts: "from-purple-950 to-purple-900",
  Proxies:  "from-amber-950 to-amber-900",
  Keys:     "from-green-950 to-green-900",
  Games:    "from-rose-950 to-rose-900",
  Digital:  "from-zinc-900 to-zinc-800",
};
const CATEGORY_DOT: Record<string, string> = {
  Software: "bg-blue-500",
  Accounts: "bg-purple-500",
  Proxies:  "bg-amber-500",
  Keys:     "bg-green-500",
  Games:    "bg-rose-500",
  Digital:  "bg-zinc-400",
};

const FEATURES = [
  { icon: Zap,          title: "Instant Delivery",    desc: "Get immediate access to your product right after payment, with no waiting or delays." },
  { icon: Headphones,   title: "24/7 Support",         desc: "Looking for help? Our team is available around the clock, all week, whenever you need." },
  { icon: DollarSign,   title: "Competitive Pricing",  desc: "The best value in the market while maintaining high quality standards." },
  { icon: Shield,       title: "Secure Payments",      desc: "Every transaction is protected. Your crypto payment is verified directly on-chain." },
  { icon: Smile,        title: "Guaranteed Happiness", desc: "Not satisfied? We'll make it right. Quality and customer happiness come first." },
  { icon: PackageCheck, title: "0% Hidden Costs",      desc: "Price you see is the price you pay. No fees, no surprises, ever." },
];

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: rates } = useGetCryptoRates();
  const { data: stats } = useGetAdminStats();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    if (!products) return ["All"];
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...cats];
  }, [products]);

  const filtered = useMemo(() => products?.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [products, search, activeCategory]);

  const accent = settings?.accentColor || "#ffffff";
  const bg = settings?.bgColor || "#000000";

  return (
    <div
      className="min-h-[100dvh] flex flex-col relative"
      style={{
        backgroundImage: `url(${starsBg})`,
        backgroundRepeat: "repeat",
        backgroundSize: "640px auto",
        backgroundColor: bg,
        color: "#fff",
      }}
    >
      {/* Dark overlay so content stays readable */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `${bg}99` }} />

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        {/* ── HERO ── */}
        <section className="text-center px-4 pt-20 pb-16 max-w-3xl mx-auto w-full">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-widest uppercase mb-8"
            style={{ color: accent, borderColor: `${accent}30`, backgroundColor: `${accent}12` }}
          >
            <Zap className="w-3 h-3" />
            {settings?.heroBadge || "INSTANT DELIVERY"}
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white mb-5">
            {settings?.heroTitle || "Premium Quality, Smart Prices"}
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {settings?.heroSubtitle || "Great products don't have to be expensive. We deliver high quality digital goods at honest prices."}
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory("All"); }}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-11 pr-5 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors backdrop-blur-sm"
              data-testid="input-search"
            />
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
            <a
              href="#products"
              className="rounded-full px-7 py-3 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent, color: bg }}
            >
              Explore Products
            </a>
            <a
              href="#why"
              className="rounded-full px-7 py-3 text-sm font-bold border border-white/15 text-white/80 hover:bg-white/5 transition-colors backdrop-blur-sm"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { icon: Star,        value: "5 ★",                             label: "Feedback Rating" },
              { icon: ShoppingBag, value: String(stats?.completedOrders ?? 0), label: "Products Sold" },
              { icon: Users,       value: String(stats?.totalOrders ?? 0),     label: "Total Customers" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-xl px-3 py-3 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white/60" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-base font-black text-white leading-none">{value}</div>
                  <div className="text-[9px] text-white/35 uppercase tracking-wider mt-0.5 truncate">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section id="products" className="px-4 sm:px-6 pb-20 max-w-6xl mx-auto w-full">
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ color: accent, borderColor: `${accent}30`, backgroundColor: `${accent}12` }}
            >
              <ShoppingBag className="w-3 h-3" />
              Here's What We've Got
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Here's What We've Got</h2>
            <p className="text-white/40 text-sm">Price you see is the price you pay. Wild concept, we know</p>
          </div>

          {/* ── CATEGORY TABS ── */}
          {!productsLoading && categories.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap justify-center mb-8">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-150 border"
                    style={
                      isActive
                        ? { backgroundColor: accent, color: bg, borderColor: accent }
                        : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.1)" }
                    }
                    data-testid={`tab-category-${cat}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shimmer h-64 rounded-2xl" />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No products found{activeCategory !== "All" ? ` in "${activeCategory}"` : ""}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered?.map((product) => {
                const gradient = CATEGORY_GRADIENT[product.category] || "from-zinc-900 to-zinc-800";
                const dot = CATEGORY_DOT[product.category] || "bg-zinc-400";
                const inStock = product.stock === null || product.stock > 0;
                return (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div
                      className="group rounded-2xl border border-white/8 overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
                      data-testid={`card-product-${product.id}`}
                    >
                      {/* Thumbnail */}
                      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <div className={`w-3 h-3 rounded-full ${dot}`} />
                            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{product.category}</span>
                          </div>
                        )}
                        {/* Stock badge */}
                        <div className="absolute bottom-3 right-3">
                          {inStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                              {product.stock === null ? "IN STOCK" : `${product.stock} IN STOCK`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-bold text-red-400 backdrop-blur-sm">
                              OUT OF STOCK
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 bg-black/50">
                        <div className="font-bold text-white text-sm mb-2 truncate">{product.name}</div>
                        <div className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Starting from</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">${product.priceUsd.toFixed(2)}</span>
                          {rates && (
                            <span className="text-[10px] text-white/30 font-mono">
                              ≈ {(product.priceUsd / rates.btcUsd).toFixed(5)} BTC
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── WHY WE'RE DIFFERENT ── */}
        <section id="why" className="px-4 sm:px-6 pb-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ color: accent, borderColor: `${accent}30`, backgroundColor: `${accent}12` }}
            >
              <Zap className="w-3 h-3" />
              INSTANT DELIVERY ADDED!
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Why We're Different</h2>
            <p className="text-white/40 text-sm">No tricks, no fees, just honest quality</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-white/8 bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="w-px h-5 bg-white/10 shrink-0 mt-0.5" />
                  <div className="font-bold text-sm text-white">{title}</div>
                </div>
                <p className="text-xs text-white/35 leading-relaxed pl-8">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center">
          <p className="text-xs text-white/20">{settings?.shopName || "Store"} — All payments verified on-chain. No middlemen.</p>
        </footer>
      </div>
    </div>
  );
}
