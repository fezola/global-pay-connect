import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
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
import { PayoutDestination } from "@/hooks/usePayoutDestinations";

interface AddDestinationDialogProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingDestination?: PayoutDestination | null;
}

// Chain configurations
const SUPPORTED_CHAINS = [
  { value: 'solana', label: 'Solana', placeholder: 'Enter Solana wallet address (e.g., 7xKXtg...)' },
  { value: 'ethereum', label: 'Ethereum', placeholder: 'Enter Ethereum address (0x...)' },
  { value: 'base', label: 'Base', placeholder: 'Enter Base address (0x...)' },
  { value: 'polygon', label: 'Polygon', placeholder: 'Enter Polygon address (0x...)' },
] as const;

export function AddDestinationDialog({
  onClose,
  onSubmit,
  editingDestination,
}: AddDestinationDialogProps) {
  const [label, setLabel] = useState(editingDestination?.label || '');
  const [chain, setChain] = useState(editingDestination?.chain || 'solana');
  const [address, setAddress] = useState(editingDestination?.address || '');
  const [isDefault, setIsDefault] = useState(editingDestination?.is_default || false);
  const [loading, setLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  const selectedChain = SUPPORTED_CHAINS.find(c => c.value === chain);
  const isValid = label.length > 0 && address.length > 0 && !addressError;

  // Validate address format based on chain
  useEffect(() => {
    if (!address) {
      setAddressError('');
      return;
    }

    if (chain === 'solana') {
      // Solana addresses are base58 encoded, typically 32-44 characters
      if (address.length < 32 || address.length > 44) {
        setAddressError('Invalid Solana address length');
      } else if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
        setAddressError('Invalid Solana address format');
      } else {
        setAddressError('');
      }
    } else {
      // EVM chains (Ethereum, Base, Polygon) use 0x addresses
      if (!address.startsWith('0x')) {
        setAddressError('Address must start with 0x');
      } else if (address.length !== 42) {
        setAddressError('Invalid address length (should be 42 characters)');
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        setAddressError('Invalid address format');
      } else {
        setAddressError('');
      }
    }
  }, [address, chain]);

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const data = {
        type: 'wallet' as const,
        label,
        chain,
        address,
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
            {editingDestination ? 'Edit Wallet Destination' : 'Add Wallet Destination'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Add a crypto wallet address to receive your payouts. All withdrawals are on-chain only.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="label">Wallet Label / Name</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Main Wallet, Cold Storage, Business Wallet"
            />
            <p className="text-xs text-muted-foreground">
              Give this wallet a memorable name
            </p>
          </div>

          <div className="space-y-2">
            <Label>Blockchain Network</Label>
            <Select value={chain} onValueChange={setChain} disabled={!!editingDestination}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {editingDestination ? 'Chain cannot be changed after creation' : 'Select the blockchain network'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Wallet Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={selectedChain?.placeholder}
              className={`font-mono text-sm ${addressError ? 'border-destructive' : ''}`}
            />
            {addressError ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {addressError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {chain === 'solana'
                  ? 'Make sure this address can receive SPL tokens (USDC/USDT)'
                  : 'Make sure this address can receive ERC-20 tokens (USDC/USDT)'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(c) => setIsDefault(c === true)}
            />
            <Label htmlFor="isDefault" className="text-sm cursor-pointer">
              Set as default payout destination
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
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

