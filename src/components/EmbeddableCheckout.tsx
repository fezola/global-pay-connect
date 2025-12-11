import { useState, useEffect } from "react";
import { X, Copy, Check, Loader2, Shield, Zap, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmbeddableCheckoutProps {
  merchantId?: string;
  merchantName?: string;
  amount?: string;
  currency?: string;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  showBranding?: boolean;
  onSuccess?: (paymentId: string) => void;
  onClose?: () => void;
  embedded?: boolean;
}

type PaymentMethod = "usdc" | "usdt" | "eth" | "sol";

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  network: string;
  icon: string;
}

const paymentMethods: PaymentMethodOption[] = [
  { id: "usdc", name: "USDC", network: "Ethereum", icon: "U" },
  { id: "usdt", name: "USDT", network: "Ethereum", icon: "T" },
  { id: "eth", name: "ETH", network: "Ethereum", icon: "E" },
  { id: "sol", name: "SOL", network: "Solana", icon: "S" },
];

const testAddresses: Record<PaymentMethod, string> = {
  usdc: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD81",
  usdt: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD81",
  eth: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD81",
  sol: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
};

export function EmbeddableCheckout({
  merchantId = "demo_merchant",
  merchantName = "Demo Store",
  amount: initialAmount = "100.00",
  currency = "USD",
  theme = "light",
  primaryColor,
  showBranding = true,
  onSuccess,
  onClose,
  embedded = false,
}: EmbeddableCheckoutProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("usdc");
  const [showMethods, setShowMethods] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"amount" | "pay" | "processing" | "success">("amount");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethod)!;
  const payAddress = testAddresses[selectedMethod];

  const copyAddress = () => {
    navigator.clipboard.writeText(payAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    setStep("pay");
  };

  const handlePay = async () => {
    setLoading(true);
    setStep("processing");
    
    const id = `pay_${Math.random().toString(36).substring(2, 14)}`;
    setPaymentId(id);

    // Simulate blockchain confirmation
    setTimeout(() => {
      setStep("success");
      setLoading(false);
      onSuccess?.(id);
    }, 3000);
  };

  const containerClass = cn(
    "w-full max-w-md mx-auto overflow-hidden transition-all duration-300",
    embedded ? "rounded-xl shadow-2xl" : "rounded-2xl shadow-2xl",
    theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"
  );

  const inputClass = cn(
    "h-12 text-lg font-mono border-2 transition-all focus:ring-2 focus:ring-offset-2",
    theme === "dark" 
      ? "bg-slate-800 border-slate-700 focus:border-primary focus:ring-primary/20" 
      : "bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
  );

  const cardClass = cn(
    "p-4 rounded-xl border-2 cursor-pointer transition-all",
    theme === "dark" ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
  );

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={cn(
        "px-6 py-5 border-b flex items-center justify-between",
        theme === "dark" ? "border-slate-800" : "border-slate-100"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">K</span>
          </div>
          <div>
            <p className="font-semibold">{merchantName}</p>
            <p className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
              Secure Payment
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {step === "amount" && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount</Label>
              <div className="relative">
                <span className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )}>
                  $
                </span>
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(inputClass, "pl-8")}
                  placeholder="0.00"
                />
                <span className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )}>
                  {currency}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Pay with</Label>
              <button
                onClick={() => setShowMethods(!showMethods)}
                className={cn(cardClass, "w-full flex items-center justify-between")}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                    theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                  )}>
                    {currentMethod.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{currentMethod.name}</p>
                    <p className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                      {currentMethod.network}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  showMethods && "rotate-180"
                )} />
              </button>

              {showMethods && (
                <div className={cn(
                  "rounded-xl border-2 overflow-hidden divide-y animate-fade-in",
                  theme === "dark" ? "border-slate-700 divide-slate-700" : "border-slate-200 divide-slate-200"
                )}>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setShowMethods(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 transition-colors",
                        theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-50",
                        method.id === selectedMethod && (theme === "dark" ? "bg-slate-800" : "bg-slate-50")
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                      )}>
                        {method.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                          {method.network}
                        </p>
                      </div>
                      {method.id === selectedMethod && (
                        <Check className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={handleContinue} 
              className="w-full h-12 text-base font-semibold"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Continue
            </Button>
          </div>
        )}

        {step === "pay" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <p className={cn("text-sm mb-1", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                Send exactly
              </p>
              <p className="text-3xl font-bold font-mono">{amount} {currentMethod.name}</p>
              <p className={cn("text-sm mt-1", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                to the address below
              </p>
            </div>

            <div className={cn(
              "p-4 rounded-xl",
              theme === "dark" ? "bg-slate-800" : "bg-slate-50"
            )}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium uppercase tracking-wide">
                  {currentMethod.network} Address
                </Label>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="h-7 px-2 gap-1">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <code className="text-xs font-mono break-all leading-relaxed block">
                {payAddress}
              </code>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handlePay} 
                className="flex-1 h-12 text-base font-semibold"
              >
                I have paid
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep("amount")}
                className="h-12"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Confirming Payment</h3>
            <p className={cn("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
              Waiting for blockchain confirmation...
            </p>
            <p className={cn("text-xs font-mono mt-4", theme === "dark" ? "text-slate-500" : "text-slate-400")}>
              {paymentId}
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful</h3>
            <p className={cn("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
              Your payment of {amount} {currentMethod.name} has been confirmed.
            </p>
            <p className={cn("text-xs font-mono mt-4", theme === "dark" ? "text-slate-500" : "text-slate-400")}>
              {paymentId}
            </p>
            {onClose && (
              <Button onClick={onClose} className="mt-6">
                Done
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {showBranding && (
        <div className={cn(
          "px-6 py-4 border-t flex items-center justify-between",
          theme === "dark" ? "border-slate-800" : "border-slate-100"
        )}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-success" />
              <span className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                Secure
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-warning" />
              <span className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                Instant
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                Global
              </span>
            </div>
          </div>
          <span className={cn("text-xs font-medium", theme === "dark" ? "text-slate-500" : "text-slate-400")}>
            Powered by Klyr
          </span>
        </div>
      )}
    </div>
  );
}

// Preview wrapper for documentation/demo
export function EmbeddableCheckoutPreview() {
  const [showWidget, setShowWidget] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-muted/50 border border-border">
        <h4 className="font-semibold mb-2">Integration Code</h4>
        <pre className="text-xs font-mono bg-card p-4 rounded-lg overflow-x-auto border border-border">
{`<script src="https://js.klyr.io/v1/checkout.js"></script>
<script>
  Klyr.checkout({
    merchantId: 'your_merchant_id',
    amount: '100.00',
    currency: 'USD',
    onSuccess: (paymentId) => {
      console.log('Payment complete:', paymentId);
    }
  });
</script>`}
        </pre>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setShowWidget(true)}>
          Preview Checkout Widget
        </Button>
      </div>

      {showWidget && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <EmbeddableCheckout
            merchantName="Demo Store"
            onClose={() => setShowWidget(false)}
            onSuccess={(id) => console.log("Payment:", id)}
          />
        </div>
      )}
    </div>
  );
}
