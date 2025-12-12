import { useState } from "react";
import { Wallet, Building2, MoreVertical, Trash2, Edit, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PayoutDestination } from "@/hooks/usePayoutDestinations";
import { cn } from "@/lib/utils";

interface PayoutDestinationCardProps {
  destination: PayoutDestination;
  onEdit: (destination: PayoutDestination) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function PayoutDestinationCard({
  destination,
  onEdit,
  onDelete,
  onSetDefault,
}: PayoutDestinationCardProps) {
  const [showFullAddress, setShowFullAddress] = useState(false);

  const formatAddress = (address: string) => {
    if (showFullAddress || address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div
      className={cn(
        "bg-card rounded-lg border p-4 hover:border-primary/50 transition-colors",
        destination.is_default && "border-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            destination.type === 'wallet' ? "bg-primary/10" : "bg-blue-500/10"
          )}>
            {destination.type === 'wallet' ? (
              <Wallet className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-blue-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{destination.label}</h3>
              {destination.is_default && (
                <Star className="h-4 w-4 text-warning fill-warning" />
              )}
              {destination.is_verified && (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
            </div>

            {destination.type === 'wallet' ? (
              <>
                <p className="text-xs text-muted-foreground mb-1 capitalize">
                  {destination.chain} Wallet
                </p>
                <button
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  className="font-mono text-sm text-foreground hover:text-primary transition-colors"
                >
                  {formatAddress(destination.address || '')}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-1">
                  {destination.bank_name}
                </p>
                <p className="font-mono text-sm">
                  ****{destination.account_number_last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  {destination.account_holder}
                </p>
              </>
            )}

            <div className="flex items-center gap-2 mt-2">
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
            <Button variant="ghost" size="icon">
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
              Edit
            </DropdownMenuItem>
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

