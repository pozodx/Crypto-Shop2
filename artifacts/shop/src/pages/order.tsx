import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useGetOrder, getGetOrderQueryKey, useVerifyOrderPayment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, Clock, AlertTriangle, ExternalLink, Lock, QrCode } from "lucide-react";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: order, isLoading } = useGetOrder(id!, { 
    query: { 
      enabled: !!id, 
      queryKey: getGetOrderQueryKey(id!),
      refetchInterval: (query) => {
        // Stop polling if completed or failed or expired
        const status = query.state.data?.status;
        if (status === "completed" || status === "failed" || status === "expired") {
          return false;
        }
        return 10000; // 10 seconds
      }
    } 
  });
  
  const verifyPayment = useVerifyOrderPayment();

  const [timeLeft, setTimeLeft] = useState<string>("--");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order?.expiresAt || order.status !== "pending") return;

    const expiryTime = new Date(order.expiresAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryTime - now;

      if (distance <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Address copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (!id) return;
    verifyPayment.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
        toast({ title: "Checking blockchain...", description: "We are scanning the network for your payment." });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Order not found.</p>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === "completed";
  const isPending = order.status === "pending";
  const isConfirming = order.status === "confirming";
  const isFailed = order.status === "failed" || order.status === "expired";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Order #{order.id.slice(0, 8)}...</h1>
            <p className="text-muted-foreground">Purchasing: {order.productName}</p>
          </div>

          <Card className="border-border bg-card shadow-xl overflow-hidden relative">
            {/* Status indicator bar at top */}
            <div className={`h-1 w-full ${
              isCompleted ? "bg-green-500" : 
              isConfirming ? "bg-blue-500 animate-pulse" : 
              isFailed ? "bg-red-500" : 
              "bg-yellow-500"
            }`} />

            <CardContent className="p-8">
              {isCompleted ? (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-500">Payment Confirmed!</h2>
                    <p className="text-muted-foreground">Your digital goods are ready.</p>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-6 border border-border relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Digital Content
                    </h3>
                    
                    <div className="bg-background rounded p-4 font-mono text-sm break-all border border-border text-primary select-all">
                      {order.digitalContent || "No content provided."}
                    </div>
                    
                    {order.deliveryNote && (
                      <div className="mt-4 text-sm text-muted-foreground bg-background/50 p-4 rounded border border-border">
                        <strong>Note:</strong> {order.deliveryNote}
                      </div>
                    )}
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    A copy has also been sent to {order.buyerEmail}
                  </div>
                </div>
              ) : isFailed ? (
                <div className="flex flex-col items-center text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-500">Order {order.status === "expired" ? "Expired" : "Failed"}</h2>
                  <p className="text-muted-foreground">This order is no longer valid. Please start a new purchase.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${isConfirming ? 'text-blue-500 animate-spin-slow' : 'text-yellow-500'}`} />
                      <div>
                        <div className="font-semibold">
                          {isConfirming ? "Confirming Payment..." : "Awaiting Payment"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isConfirming ? "Waiting for blockchain confirmations" : "Send the exact amount below"}
                        </div>
                      </div>
                    </div>
                    {isPending && (
                      <div className="text-right font-mono text-xl font-bold text-yellow-500">
                        {timeLeft}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-6">
                    <div className="p-4 bg-white rounded-xl shadow-sm flex items-center justify-center w-56 h-56 border border-border">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>

                    <div className="w-full space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Amount to send</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted p-3 rounded font-mono text-xl font-bold text-primary text-center border border-border">
                            {order.cryptoAmount} {order.cryptoCurrency}
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-[52px] w-[52px] shrink-0"
                            onClick={() => copyToClipboard(order.cryptoAmount)}
                          >
                            <Copy className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Send to address</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted p-3 rounded font-mono text-sm break-all border border-border text-center">
                            {order.walletAddress}
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-[46px] w-[46px] shrink-0"
                            onClick={() => copyToClipboard(order.walletAddress)}
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="w-full pt-4">
                      <Button 
                        onClick={handleVerify} 
                        disabled={verifyPayment.isPending || isConfirming}
                        className="w-full h-12 text-lg relative overflow-hidden"
                        data-testid="button-verify-payment"
                      >
                        {verifyPayment.isPending || isConfirming ? "Scanning Blockchain..." : "I've sent the payment"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
