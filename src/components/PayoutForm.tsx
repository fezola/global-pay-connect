import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface PayoutFormProps {
  onClose: () => void;
  maxBalance: number;
}

export function PayoutForm({ onClose, maxBalance }: PayoutFormProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [destinationType, setDestinationType] = useState<"onchain" | "bank">("onchain");
  const [destination, setDestination] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addPayout, updatePayout, updateBalance } = useAppStore();
  const { toast } = useToast();

  const numAmount = parseFloat(amount) || 0;
  const fee = destinationType === "onchain" ? 0.1 : 5.0;
  const eta = destinationType === "onchain" ? "Instant" : "1-3 business days";

  const isValid = numAmount > 0 && numAmount <= maxBalance && destination.length > 0 && confirmed;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);

    const payoutId = `po_${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();

    addPayout({
      id: payoutId,
      status: 'pending',
      amount: numAmount.toFixed(2),
      currency,
      destination,
      destinationType,
      createdAt: now,
      fee: fee.toFixed(2),
    });

    toast({ title: "Payout requested", description: "Processing your withdrawal..." });

    // Simulate payout processing
    setTimeout(() => {
      updatePayout(payoutId, { status: 'processing' });
    }, 500);

    setTimeout(() => {
      updatePayout(payoutId, { status: 'paid' });
      updateBalance(currency, -(numAmount + fee));
      setLoading(false);
      toast({ title: "Payout completed", description: `${numAmount.toFixed(2)} ${currency} sent to ${destination.substring(0, 10)}...` });
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Request Payout</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payout-amount">Amount</Label>
            <Input
              id="payout-amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Available: {maxBalance.toFixed(2)} {currency}
            </p>
            {numAmount > maxBalance && (
              <p className="text-xs text-destructive">Exceeds available balance</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Destination Method</Label>
            <Select value={destinationType} onValueChange={(v) => setDestinationType(v as "onchain" | "bank")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onchain">On-chain (Wallet)</SelectItem>
                <SelectItem value="bank">Bank (IBAN/Account)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">
              {destinationType === "onchain" ? "Wallet Address" : "IBAN / Account Number"}
            </Label>
            <Input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={destinationType === "onchain" ? "0x..." : "DE89..."}
              className="font-mono text-sm"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-mono">{fee.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ETA</span>
              <span>{eta}</span>
            </div>
            {numAmount > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
                <span className="font-medium">Total deducted</span>
                <span className="font-mono font-medium">{(numAmount + fee).toFixed(2)} {currency}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <Label htmlFor="confirm" className="text-sm text-muted-foreground cursor-pointer">
              I confirm this payout request
            </Label>
          </div>

          <div className="pt-2 flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={!isValid || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Request Payout"
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
