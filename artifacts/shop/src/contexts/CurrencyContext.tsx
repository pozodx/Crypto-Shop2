import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";

export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF"
  | "CNY" | "KRW" | "INR" | "BRL" | "MXN" | "SGD" | "HKD"
  | "RUB" | "TRY" | "SEK" | "NOK" | "DKK" | "PLN" | "AED" | "ZAR";

export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$",    name: "US Dollar" },
  { code: "EUR", symbol: "€",    name: "Euro" },
  { code: "GBP", symbol: "£",    name: "British Pound" },
  { code: "JPY", symbol: "¥",    name: "Japanese Yen" },
  { code: "CAD", symbol: "C$",   name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$",   name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr",   name: "Swiss Franc" },
  { code: "CNY", symbol: "¥",    name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩",    name: "Korean Won" },
  { code: "INR", symbol: "₹",    name: "Indian Rupee" },
  { code: "BRL", symbol: "R$",   name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$",  name: "Mexican Peso" },
  { code: "SGD", symbol: "S$",   name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$",  name: "Hong Kong Dollar" },
  { code: "RUB", symbol: "₽",    name: "Russian Ruble" },
  { code: "TRY", symbol: "₺",    name: "Turkish Lira" },
  { code: "SEK", symbol: "kr",   name: "Swedish Krona" },
  { code: "NOK", symbol: "kr",   name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr",   name: "Danish Krone" },
  { code: "PLN", symbol: "zł",   name: "Polish Złoty" },
  { code: "AED", symbol: "د.إ",  name: "UAE Dirham" },
  { code: "ZAR", symbol: "R",    name: "South African Rand" },
];

interface CurrencyCtx {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (usd: number) => string;
  symbol: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (usd) => `$${usd.toFixed(2)}`,
  symbol: "$",
  loading: false,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) setRates(data.rates as Record<string, number>);
      })
      .catch(() => {}) // fallback: use USD rates (1:1)
      .finally(() => setLoading(false));
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  const meta = CURRENCIES.find((c) => c.code === currency)!;
  const symbol = meta?.symbol ?? "$";

  const formatPrice = (usd: number): string => {
    const rate = rates[currency] ?? 1;
    const converted = usd * rate;
    const fmt = new Intl.NumberFormat("en", {
      minimumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
      maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
    });
    return `${symbol}${fmt.format(converted)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, symbol, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
