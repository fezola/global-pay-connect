import { useState, useEffect } from "react";
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
import { PayoutDestination } from "@/hooks/usePayoutDestinations";

interface AddDestinationDialogProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingDestination?: PayoutDestination | null;
}

export function AddDestinationDialog({
  onClose,
  onSubmit,
  editingDestination,
}: AddDestinationDialogProps) {
  const [type, setType] = useState<'wallet' | 'bank'>(editingDestination?.type || 'wallet');
  const [label, setLabel] = useState(editingDestination?.label || '');
  const [chain, setChain] = useState(editingDestination?.chain || 'solana');
  const [address, setAddress] = useState(editingDestination?.address || '');
  const [bankName, setBankName] = useState(editingDestination?.bank_name || '');
  const [accountHolder, setAccountHolder] = useState(editingDestination?.account_holder || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState(editingDestination?.routing_number || '');
  const [isDefault, setIsDefault] = useState(editingDestination?.is_default || false);
  const [loading, setLoading] = useState(false);

  const isValid = type === 'wallet'
    ? label.length > 0 && address.length > 0
    : label.length > 0 && bankName.length > 0 && accountHolder.length > 0 && accountNumber.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const data = type === 'wallet'
        ? { type, label, chain, address, is_default: isDefault }
        : {
            type,
            label,
            bank_name: bankName,
            account_holder: accountHolder,
            account_number_last4: accountNumber.slice(-4),
            routing_number: routingNumber,
            is_default: isDefault,
          };

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving destination:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">
            {editingDestination ? 'Edit Destination' : 'Add Payout Destination'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Destination Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'wallet' | 'bank')} disabled={!!editingDestination}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">Crypto Wallet</SelectItem>
                <SelectItem value="bank">Bank Account (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label / Name</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Main Wallet, Business Account"
            />
          </div>

          {type === 'wallet' ? (
            <>
              <div className="space-y-2">
                <Label>Blockchain</Label>
                <Select value={chain} onValueChange={setChain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solana">Solana</SelectItem>
                    <SelectItem value="ethereum" disabled>Ethereum (Coming Soon)</SelectItem>
                    <SelectItem value="base" disabled>Base (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Solana wallet address"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure this address can receive SPL tokens (USDC/USDT)
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Chase, Bank of America"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full name on account"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="password"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                <Input
                  id="routingNumber"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="9-digit routing number"
                  className="font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(c) => setIsDefault(c === true)}
            />
            <Label htmlFor="isDefault" className="text-sm cursor-pointer">
              Set as default destination
            </Label>
          </div>

          <div className="pt-2 flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={!isValid || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingDestination ? 'Update Destination' : 'Add Destination'
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

