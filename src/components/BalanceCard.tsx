import { ArrowDownLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BalanceCardProps {
  currency: string;
  total: string;
  onchain: string;
  offchain: string;
  onReceive: () => void;
}

export function BalanceCard({ currency, total, onchain, offchain, onReceive }: BalanceCardProps) {
  return (
    <div className="bg-card rounded-lg p-card-pad shadow-sm border border-border min-w-[280px] animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground font-medium">{currency}</div>
          <div className="text-3xl font-semibold mt-1 tracking-tight">{total}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onReceive} size="sm" className="gap-1.5">
            <ArrowDownLeft className="h-4 w-4" />
            Receive
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Convert</DropdownMenuItem>
              <DropdownMenuItem>Simulate deposit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">On-chain</span>
          <span className="font-mono text-sm">{onchain}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Off-chain</span>
          <span className="font-mono text-sm">{offchain}</span>
        </div>
      </div>
    </div>
  );
}
