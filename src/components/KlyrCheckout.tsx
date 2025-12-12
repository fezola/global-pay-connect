import { useState, useEffect } from "react";
import { X, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePaymentIntents } from "@/hooks/usePaymentIntents";
import { useToast } from "@/hooks/use-toast";
import { PaymentQRCode } from "@/components/PaymentQRCode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnvironmentMode } from "@/hooks/useEnvironmentMode";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KlyrCheckoutProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function KlyrCheckout({ onClose, onSuccess }: KlyrCheckoutProps) {
  const [amount, setAmount] = useState("100.00");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const { createPaymentIntent } = usePaymentIntents();
  const { toast } = useToast();
  const { isTestMode } = useEnvironmentMode();

  const copyAddress = () => {
    if (paymentIntent?.payment_address) {
      navigator.clipboard.writeText(paymentIntent.payment_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreatePayment = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data, error } = await createPaymentIntent({
      amount: numAmount,
      currency: 'USDC',
      description: 'Test payment',
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Failed to create payment",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setPaymentIntent(data);
    toast({
      title: "Payment created",
      description: "Send USDC to the address below to complete payment"
    });
  };

  // Listen for payment status updates
  useEffect(() => {
    if (paymentIntent?.status === 'succeeded') {
      toast({
        title: "Payment confirmed!",
        description: `+${paymentIntent.amount} ${paymentIntent.currency} received`
      });
      onSuccess?.();
      setTimeout(() => onClose(), 2000);
    }
  }, [paymentIntent?.status, onSuccess, onClose, toast, paymentIntent?.amount, paymentIntent?.currency]);

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {paymentIntent ? 'Complete Payment' : 'Create Payment'}
            </h3>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              isTestMode
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            }`}>
              {isTestMode ? "Test" : "Live"}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {isTestMode && (
            <Alert className="border-warning/50 bg-warning/5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-xs">
                Test mode: No real funds will be processed
              </AlertDescription>
            </Alert>
          )}

          {!paymentIntent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  className="font-mono"
                  disabled={loading}
                />
              </div>

              <Button onClick={handleCreatePayment} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Payment...
                  </>
                ) : (
                  "Create Payment Intent"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="text-2xl font-bold">
                  {paymentIntent.amount} {paymentIntent.currency}
                </div>
              </div>

              <Tabs defaultValue="address" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                </TabsList>

                <TabsContent value="address" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Address (Solana)</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                        {paymentIntent.payment_address}
                      </code>
                      <Button variant="outline" size="icon" onClick={copyAddress}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    <p className="mb-2">To complete this payment:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Copy the payment address above</li>
                      <li>Send exactly {paymentIntent.amount} USDC on Solana</li>
                      <li>Wait for blockchain confirmation (~30 seconds)</li>
                    </ol>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="flex justify-center py-4">
                  <PaymentQRCode
                    address={paymentIntent.payment_address}
                    amount={paymentIntent.amount}
                    currency={paymentIntent.currency}
                    label="Klyr Payment"
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    paymentIntent.status === 'succeeded' ? 'bg-green-500' :
                    paymentIntent.status === 'processing' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm capitalize">{paymentIntent.status}</span>
                </div>
              </div>

              {paymentIntent.status === 'pending' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Waiting for payment...
                </div>
              )}
            </>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
