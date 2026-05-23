import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey, useVerifyOrderPayment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertTriangle, ArrowLeft, Clock } from "lucide-react";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id!, {
    query: {
      enabled: !!id,
      queryKey: getGetOrderQueryKey(id!),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "completed" || status === "failed" || status === "expired") return false;
        return 10000;
      },
    },
  });

  const verifyPayment = useVerifyOrderPayment();

  const [timeLeft, setTimeLeft] = useState("–:––:––");
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    if (!order?.expiresAt || order.status !== "pending") return;
    const expiry = new Date(order.expiresAt).getTime();
    const tick = () => {
      const diff = expiry - Date.now();
      if (diff <= 0) { setTimeLeft("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [order]);

  const copy = (text: string, which: "amount" | "address") => {
    navigator.clipboard.writeText(text);
    if (which === "amount") { setCopiedAmount(true); setTimeout(() => setCopiedAmount(false), 2000); }
    else { setCopiedAddress(true); setTimeout(() => setCopiedAddress(false), 2000); }
  };

  const handleVerify = () => {
    if (!id) return;
    verifyPayment.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) }),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Order not found.</div>
      </div>
    );
  }

  const isCompleted = order.status === "completed";
  const isPending = order.status === "pending";
  const isFailed = order.status === "failed" || order.status === "expired";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to store
          </Link>

          {/* Order header */}
          <div className="mb-5">
            <p className="text-xs text-muted-foreground font-mono">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="text-xl font-bold mt-0.5">{order.productName}</h1>
          </div>

          {/* COMPLETED */}
          {isCompleted && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 space-y-6 glow-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-400">Payment Confirmed</p>
                  <p className="text-xs text-muted-foreground">Transaction verified on-chain</p>
                </div>
              </div>

              <div className="rounded-lg bg-background border border-border p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Your product</p>
                <pre className="text-sm font-mono text-primary break-all whitespace-pre-wrap select-all leading-relaxed">
                  {order.digitalContent || "No content provided."}
                </pre>
              </div>

              {order.deliveryNote && (
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 border border-border">
                  {order.deliveryNote}
                </div>
              )}

              {order.txHash && (
                <p className="text-[10px] text-muted-foreground font-mono break-all">
                  TX: {order.txHash}
                </p>
              )}
            </div>
          )}

          {/* EXPIRED / FAILED */}
          {isFailed && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-400">Order {order.status === "expired" ? "Expired" : "Failed"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Please start a new purchase.</p>
              </div>
            </div>
          )}

          {/* PENDING / CONFIRMING */}
          {isPending && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 status-pulse inline-block"></span>
                  <span className="text-amber-400 font-medium text-xs">Awaiting payment</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {timeLeft}
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Amount */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Amount to send</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono font-bold text-xl text-primary text-center">
                      {order.cryptoAmount} {order.cryptoCurrency}
                    </div>
                    <button
                      onClick={() => copy(order.cryptoAmount, "amount")}
                      className="w-11 h-11 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shrink-0"
                      data-testid="button-copy-amount"
                    >
                      {copiedAmount ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Send to address</p>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-xs break-all leading-relaxed text-foreground/90">
                      {order.walletAddress || <span className="text-muted-foreground italic">Wallet address not configured</span>}
                    </div>
                    <button
                      onClick={() => copy(order.walletAddress, "address")}
                      className="w-11 h-11 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shrink-0 mt-0"
                      data-testid="button-copy-address"
                    >
                      {copiedAddress ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Network warning */}
                <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-md px-3 py-2 border border-border/50">
                  Send only <strong className="text-foreground">{order.cryptoCurrency}</strong> to this address. Sending any other asset will result in permanent loss.
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={verifyPayment.isPending}
                  className="w-full h-10 text-sm font-semibold"
                  data-testid="button-verify-payment"
                >
                  {verifyPayment.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Scanning blockchain...
                    </span>
                  ) : (
                    "I've sent the payment"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-muted-foreground mt-6">
            Payment for {order.buyerEmail} · Auto-verified every 10 seconds
          </p>
        </div>
      </main>
    </div>
  );
}
