import { useState } from "react";
import { Wallet, MoreVertical, Trash2, Edit, Star, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PayoutDestination } from "@/hooks/usePayoutDestinations";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PayoutDestinationCardProps {
  destination: PayoutDestination;
  onEdit: (destination: PayoutDestination) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

// Chain-specific explorer URLs
const getExplorerUrl = (chain: string, address: string): string | null => {
  const explorers: Record<string, string> = {
    solana: `https://solscan.io/account/${address}`,
    ethereum: `https://etherscan.io/address/${address}`,
    base: `https://basescan.org/address/${address}`,
    polygon: `https://polygonscan.com/address/${address}`,
  };
  return explorers[chain] || null;
};

export function PayoutDestinationCard({
  destination,
  onEdit,
  onDelete,
  onSetDefault,
}: PayoutDestinationCardProps) {
  const [showFullAddress, setShowFullAddress] = useState(false);
  const { toast } = useToast();

  const formatAddress = (address: string) => {
    if (showFullAddress || address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const copyAddress = () => {
    if (destination.address) {
      navigator.clipboard.writeText(destination.address);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const explorerUrl = destination.chain && destination.address
    ? getExplorerUrl(destination.chain, destination.address)
    : null;

  return (
    <div
      className={cn(
        "bg-card rounded-lg border p-4 hover:border-primary/50 transition-colors",
        destination.is_default && "border-primary ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{destination.label}</h3>
              {destination.is_default && (
                <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
              )}
              {destination.is_verified && (
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-2 capitalize">
              {destination.chain} Network
            </p>

            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
                className="font-mono text-xs text-foreground hover:text-primary transition-colors truncate"
              >
                {formatAddress(destination.address || '')}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={copyAddress}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {explorerUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => window.open(explorerUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {destination.is_default && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Default
                </span>
              )}
              {destination.is_verified ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                  Verified
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!destination.is_default && (
              <DropdownMenuItem onClick={() => onSetDefault(destination.id)}>
                <Star className="h-4 w-4 mr-2" />
                Set as default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(destination)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit label
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="h-4 w-4 mr-2" />
              Copy address
            </DropdownMenuItem>
            {explorerUrl && (
              <DropdownMenuItem onClick={() => window.open(explorerUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on explorer
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(destination.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

