import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Plus } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { usePayouts } from "@/hooks/usePayouts";
import { useEnvironmentMode } from "@/hooks/useEnvironmentMode";
import { usePayoutDestinations } from "@/hooks/usePayoutDestinations";
import { useNavigate } from "react-router-dom";

interface PayoutFormProps {
  onClose: () => void;
  maxBalance: number;
}

export function PayoutForm({ onClose, maxBalance }: PayoutFormProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("custom");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createPayout } = usePayouts();
  const { isTestMode } = useEnvironmentMode();
  const { destinations } = usePayoutDestinations();
  const navigate = useNavigate();

  // Only wallet destinations (crypto-only platform)
  const availableDestinations = destinations.filter(d => d.type === 'wallet');

  // Get selected destination details
  const selectedDestination = destinations.find(d => d.id === selectedDestinationId);
  const selectedChain = selectedDestination?.chain || 'solana';

  // Auto-select default destination
  useEffect(() => {
    const defaultDest = availableDestinations.find(d => d.is_default);
    if (defaultDest && selectedDestinationId === "custom") {
      setSelectedDestinationId(defaultDest.id);
      setDestination(defaultDest.address || "");
    }
  }, [availableDestinations]);

  // Update destination address when selection changes
  useEffect(() => {
    if (selectedDestinationId === "custom") {
      setDestination("");
    } else {
      const selected = destinations.find(d => d.id === selectedDestinationId);
      if (selected) {
        setDestination(selected.address || "");
      }
    }
  }, [selectedDestinationId, destinations]);

  const numAmount = parseFloat(amount) || 0;

  // Calculate fee (0.5% or minimum $1)
  const feePercent = 0.005;
  const calculatedFee = numAmount * feePercent;
  const fee = Math.max(calculatedFee, 1.0);
  const netAmount = numAmount - fee;

  // ETA varies by chain
  const chainETAs: Record<string, string> = {
    solana: '5-10 minutes',
    ethereum: '2-5 minutes',
    base: '1-2 minutes',
    polygon: '1-3 minutes',
  };
  const eta = chainETAs[selectedChain] || '5-10 minutes';
  const minWithdrawal = 10;

  const isValid = numAmount >= minWithdrawal && numAmount <= maxBalance && destination.length > 0 && confirmed;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);

    try {
      await createPayout({
        amount: amount,
        currency,
        destination_address: destination,
        notes,
      });

      toast({
        title: "Payout requested successfully",
        description: numAmount > 1000
          ? "Your payout requires approval and will be processed shortly."
          : "Your payout will be processed shortly."
      });

      onClose();
    } catch (error: any) {
      console.error('Payout error:', error);
      // Error toast is handled in usePayouts hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Request Payout</h3>
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
                Test mode: Payouts will use devnet tokens
              </AlertDescription>
            </Alert>
          )}

          {numAmount > 1000 && (
            <Alert className="border-blue-500/50 bg-blue-500/5">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs">
                Payouts over $1,000 require manual approval
              </AlertDescription>
            </Alert>
          )}
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
              Available: {maxBalance.toFixed(2)} {currency} • Minimum: ${minWithdrawal}
            </p>
            {numAmount > 0 && numAmount < minWithdrawal && (
              <p className="text-xs text-destructive">Minimum withdrawal is ${minWithdrawal}</p>
            )}
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

          {availableDestinations.length > 0 && (
            <div className="space-y-2">
              <Label>Select Destination</Label>
              <Select value={selectedDestinationId} onValueChange={setSelectedDestinationId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableDestinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      {dest.label} ({dest.chain}) {dest.is_default && "⭐"}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Address...</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => navigate('/payout-destinations')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Manage destinations
              </Button>
            </div>
          )}

          {selectedDestinationId === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="destination">
                {destinationType === "wallet" ? "Solana Wallet Address" : "IBAN / Account Number"}
              </Label>
              <Input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={destinationType === "wallet" ? "Enter Solana wallet address..." : "DE89..."}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {destinationType === "wallet"
                  ? "Make sure this is a valid Solana address that can receive SPL tokens"
                  : "Bank payouts are not yet available"}
              </p>
            </div>
          )}

          {selectedDestinationId !== "custom" && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Destination Address</p>
              <p className="font-mono text-sm break-all">{destination}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for this payout..."
              className="text-sm"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payout amount</span>
              <span className="font-mono">{numAmount.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fee (0.5%, min $1)</span>
              <span className="font-mono">{fee.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ETA</span>
              <span>{eta}</span>
            </div>
            {numAmount > 0 && (
              <>
                <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
                  <span className="font-medium">You will receive</span>
                  <span className="font-mono font-medium text-success">{netAmount.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total deducted from balance</span>
                  <span className="font-mono font-medium">{numAmount.toFixed(2)} {currency}</span>
                </div>
              </>
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
