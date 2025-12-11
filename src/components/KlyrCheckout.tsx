import { useState } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface KlyrCheckoutProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function KlyrCheckout({ onClose, onSuccess }: KlyrCheckoutProps) {
  const [amount, setAmount] = useState("100.00");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addTransaction, updateTransaction, updateBalance } = useAppStore();
  const { toast } = useToast();

  const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD81";

  const copyAddress = () => {
    navigator.clipboard.writeText(testAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    const txId = `tx_${Math.random().toString(36).substring(2, 14)}`;
    const now = new Date().toISOString();
    
    addTransaction({
      id: txId,
      status: 'pending',
      type: 'deposit',
      amount: numAmount.toFixed(2),
      currency: 'USDC',
      description: 'Test payment',
      createdAt: now,
      updatedAt: now,
      auditLogs: [
        { timestamp: now, event: 'charge_created', details: 'Payment intent created' },
      ],
    });

    toast({ title: "Payment initiated", description: "Waiting for on-chain confirmation..." });

    // Simulate blockchain confirmation
    setTimeout(() => {
      const confirmedTime = new Date().toISOString();
      updateTransaction(txId, {
        status: 'settled_onchain',
        updatedAt: confirmedTime,
        txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
        auditLogs: [
          { timestamp: now, event: 'charge_created', details: 'Payment intent created' },
          { timestamp: confirmedTime, event: 'payment_received', details: 'On-chain payment detected' },
          { timestamp: confirmedTime, event: 'settled', details: 'Transaction confirmed' },
        ],
      });
      updateBalance('USDC', numAmount);
      
      setLoading(false);
      toast({ title: "Payment confirmed", description: `+${numAmount.toFixed(2)} USDC added to your balance` });
      onSuccess?.();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Receive Test USDC</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Test Address</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                {testAddress}
              </code>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button onClick={handlePay} className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay"
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
